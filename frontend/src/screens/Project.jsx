
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage, removeListener, disconnectSocket } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webcontainer'
import 'highlight.js/styles/github-dark.css'

function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)
            ref.current.removeAttribute('data-highlighted')
        }
    }, [props.className, props.children])

    return <code {...props} ref={ref} />
}

const Project = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Added for potential navigation

    // Check for location.state.project
    if (!location.state?.project) {
        // Optionally, you could try to extract projectId from URL params if your route is like /project/:id
        // const { projectId } = useParams();
        // if (projectId) { /* Add logic here to fetch project by id, then setProject */ }

        // For now, just show a message and an option to go back or to home.
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
                <i className="ri-error-warning-line text-6xl text-primary mb-4"></i>
                <h1 className="text-3xl font-semibold mb-2">Project Data Not Found</h1>
                <p className="text-muted-foreground mb-6 text-center">
                    The project data could not be loaded. This might happen if you navigated directly to this page <br />
                    or if the project does not exist.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate(-1)} // Go back
                        className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')} // Go to Home
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(new Set())
    const [project, setProject] = useState(location.state.project) // This is now safe
    const [message, setMessage] = useState('')
    const { user } = useContext(UserContext)
    const messageBox = React.createRef()


    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [fileTree, setFileTree] = useState({})

    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([])

    const [webContainer, setWebContainer] = useState(null)
    const [iframeUrl, setIframeUrl] = useState(null)
    const [runProcess, setRunProcess] = useState(null)

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId)
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id)
            } else {
                newSelectedUserId.add(id)
            }
            return newSelectedUserId
        })
    }

    function addCollaborators() {
        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => {
            console.log(res.data)
            setIsModalOpen(false)
        }).catch(err => {
            console.log(err)
        })
    }

    const send = () => {
        // if (!message.trim()) return

        sendMessage('project-message', {
            message,
            sender: user
        })
        setMessages(prevMessages => [...prevMessages, { sender: user, message }])
        setMessage("")
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
        }
    }

    function WriteAiMessage(message) {
        const messageObject = JSON.parse(message)
        // This div is part of the AI message bubble, which already has bg-muted.
        // So, this inner div should likely be transparent or inherit, and text should be foreground for that muted background.
        // Or, if it's meant to be a distinct "code block" style within the AI message, it can have its own card-like appearance.
        // Let's make it subtly distinct but part of the muted bubble.
        return (
            <div className='overflow-auto bg-muted/50 text-foreground rounded-lg p-3 border border-border'>
                <Markdown
                    children={messageObject.text}
                    options={{
                        overrides: {
                            code: SyntaxHighlightedCode,
                        },
                    }}
                />
            </div>
        )
    }

    }

    // Define handleProjectMessage using useCallback
    const handleProjectMessage = useCallback((data) => {
        console.log("Received project-message:", data);
        const isAI = data?.sender?._id === 'ai';
        if (isAI) {
            let messageData = null;
            try {
                // Assuming data.message is the stringified JSON from AI
                messageData = typeof data.message === 'string' ? JSON.parse(data.message) : data.message;
                console.log("Parsed AI message data:", messageData);
            } catch (err) {
                console.error("Failed to parse AI message JSON:", data.message, err);
                // If parsing fails, still add the raw data to messages to see what was received
                setMessages((prevMessages) => [...prevMessages, { ...data, message: "Error: AI sent unparsable message." }]);
                return;
            }

            if (messageData?.fileTree && webContainer) {
                console.log("Mounting fileTree from AI message");
                webContainer.mount(messageData.fileTree);
                setFileTree(messageData.fileTree); // Assuming setFileTree is stable
            }
             // Add the original data structure to messages, but ensure message field is appropriately handled
            setMessages((prevMessages) => [...prevMessages, { ...data, message: messageData?.text || data.message }]);
        } else {
            setMessages((prevMessages) => [...prevMessages, data]);
        }
    }, [webContainer]); // Dependencies: webContainer and setFileTree (if it weren't stable from useState)

    useEffect(() => {
        // Since 'project' state is initialized from location.state.project,
        // and we've checked location.state.project is not null/undefined before this point,
        // project._id should be safe to use here.
        // However, if project state could be nullified by other means later,
        // an additional check `if (!project?._id) return;` might be warranted here.
        // For now, assuming project._id is valid due to the initial check.
        if (!project?._id) {
            console.error("Project ID is missing, cannot initialize socket or fetch data.");
            // Optionally, navigate away or show a more persistent error
            return;
        }
        initializeSocket(project._id);
        receiveMessage('project-message', handleProjectMessage);

        // Initialize WebContainer
        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container);
                console.log("WebContainer started");
            }).catch(err => console.error("Failed to initialize WebContainer:", err));
        }

        // Fetch initial project data
        axios.get(`/projects/get-project/${project._id}`)
            .then(res => {
                console.log("Project data fetched:", res.data.project);
                setProject(res.data.project);
                setFileTree(res.data.project.fileTree || {});
            })
            .catch(err => console.error("Failed to fetch project data:", err));

        // Fetch users
        axios.get('/users/all')
            .then(res => {
                setUsers(res.data.users);
            })
            .catch(err => console.error("Failed to fetch users:", err));

        return () => {
            removeListener('project-message', handleProjectMessage);
            // Note: disconnectSocket is handled by the separate unmount effect
        };
    }, [project._id, handleProjectMessage]); // webContainer is a dependency of handleProjectMessage

    // Effect for final unmount cleanup
    useEffect(() => {
        return () => {
            disconnectSocket();
        };
    }, []);


    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight
        }
    }, [messages])

    function scrollToBottom() {
        messageBox.current.scrollTop = messageBox.current.scrollHeight
    }

    return (
        <main className='h-screen w-screen flex bg-background text-foreground overflow-hidden'>
            {/* Left Panel - Chat */}
            <section className="flex flex-col h-full w-96 bg-secondary border-r border-border">
                <header className='flex justify-between items-center p-4 border-b border-border'>
                    <h1 className='text-xl font-bold text-primary'>{project.name}</h1>
                    <div className='flex gap-3'>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className='p-2 rounded-md hover:bg-muted transition-colors'
                            title="Add Collaborator"
                        >
                            <i className="ri-user-add-line"></i>
                        </button>
                        <button
                            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                            className='p-2 rounded-md hover:bg-muted transition-colors'
                            title="Collaborators"
                        >
                            <i className="ri-group-fill"></i>
                        </button>
                    </div>
                </header>

                {/* <div className="flex-grow flex flex-col h-full relative"> */}
                <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
                    <div
                        ref={messageBox}
                        className="flex-grow p-4 flex flex-col gap-3 overflow-auto scrollbar-hide scrollbar-thumb-muted scrollbar-track-secondary"
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex flex-col ${msg.sender?._id === user?._id?.toString() ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`flex items-center gap-2 mb-1 ${msg.sender?._id === user?._id?.toString() ? 'justify-end' : ''}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${msg.sender?._id === user?._id?.toString() ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
                                        {msg.sender?.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <small className='text-muted-foreground text-xs'>{msg.sender?.email}</small>
                                </div>
                                <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender?._id === user?._id?.toString() ? 'bg-primary text-primary-foreground' : msg.sender?._id === 'ai' ? 'bg-muted text-muted-foreground' : 'bg-card text-foreground'}`}>
                                    {msg.sender._id === 'ai' ?
                                        WriteAiMessage(msg.message) :
                                        <p className='text-foreground'>{msg.message}</p>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-2 bg-input rounded-lg p-2">
                             <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className='flex-grow bg-transparent outline-none text-foreground placeholder-muted-foreground'
                                type="text"
                                placeholder='Type a message...'
                            /> 
                             
                             <button
                                onClick={send}
                                disabled={!message.trim()}
                                className={`p-2 rounded-full ${message.trim() ? 'text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
                            >
                                <i className="ri-send-plane-fill"></i>
                            </button> 
                             
                        </div>
                    </div>
                </div>

                {/* Collaborators Side Panel */}
                <div className={`absolute inset-y-0 left-0 w-80 bg-secondary border-r border-border z-20 shadow-xl transition-transform duration-300 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <header className='flex justify-between items-center p-4 border-b border-border'>
                        <h1 className='text-lg font-semibold text-foreground'>Collaborators</h1>
                        <button
                            onClick={() => setIsSidePanelOpen(false)}
                            className='p-1 rounded-md hover:bg-muted'
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </header>
                    <div className="p-4 space-y-3 overflow-y-auto">
                        {project.users && project.users.map((user, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                                <div className='w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground'>
                                    {/* {user.email.charAt(0).toUpperCase()} */}
                                </div>
                                <div>
                                    <h3 className='font-medium text-foreground'>{user.email}</h3>
                                    <p className='text-xs text-muted-foreground'>Active</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Right Panel - Code Editor */}
            <section className="flex-grow flex flex-col h-full bg-background">
                {/* File Explorer + Editor Container */}
                <div className="flex flex-grow overflow-hidden">
                    {/* File Explorer */}
                    <div className="w-64 bg-secondary border-r border-border flex flex-col">
                        <div className="p-3 border-b border-border flex justify-between items-center">
                            <h2 className='font-semibold text-muted-foreground'>EXPLORER</h2>
                            <button className='text-muted-foreground hover:text-foreground'>
                                <i className="ri-add-line"></i>
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-secondary">
                            {Object.keys(fileTree).map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentFile(file)
                                        setOpenFiles([...new Set([...openFiles, file])])
                                    }}
                                    className={`w-full text-left p-2 px-4 flex items-center gap-2 hover:bg-muted ${currentFile === file ? 'bg-muted text-primary' : 'text-foreground'}`}
                                >
                                    <i className={`ri-${file.includes('.') ? 'file-line' : 'folder-line'} text-accent`}></i>
                                    <span className='truncate'>{file}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-grow flex flex-col bg-background">
                        {/* File Tabs */}
                        <div className="flex items-center bg-secondary border-b border-border overflow-x-auto scrollbar-thin">
                            {openFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center border-r border-border ${currentFile === file ? 'bg-background' : 'bg-secondary'}`}
                                >
                                    <button
                                        onClick={() => setCurrentFile(file)}
                                        className={`px-4 py-2 flex items-center gap-2 ${currentFile === file ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <i className={`ri-${file.includes('.') ? 'file-line' : 'folder-line'}`}></i>
                                        <span className='truncate max-w-xs'>{file}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setOpenFiles(openFiles.filter(f => f !== file))
                                            if (currentFile === file) {
                                                setCurrentFile(openFiles.length > 1 ? openFiles[index === 0 ? 1 : index - 1] : null)
                                            }
                                        }}
                                        className='p-1 mr-1 text-muted-foreground hover:text-foreground'
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Editor Content */}
                        <div className="flex-grow relative">
                            {fileTree[currentFile] ? (
                                <div className="absolute inset-0 overflow-auto">
                                    <pre className="h-full bg-background"> {/* Editor background */}
                                        <code
                                            className="block h-full p-4 outline-none font-mono text-sm text-foreground" // Editor text
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText
                                                const ft = {
                                                    ...fileTree,
                                                    [currentFile]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                            dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value }}
                                        />
                                    </pre>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <i className="ri-file-code-line text-4xl mb-2"></i>
                                        <p>No file selected</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status Bar */}
                        <div className="bg-primary text-primary-foreground px-4 py-1 text-xs flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={async () => {
                                        if (!webContainer) {
                                            console.warn("WebContainer not initialized yet.");
                                            return;
                                        }

                                        try {
                                            console.log("Mounting files to WebContainer...");
                                            await webContainer.mount(fileTree);
                                        } catch (error) {
                                            console.error("Error during WebContainer mount:", error);
                                            // Optionally, inform the user via UI notification
                                            return; // Stop if mounting fails
                                        }

                                        let installProcess;
                                        try {
                                            console.log("Running npm install...");
                                            installProcess = await webContainer.spawn("npm", ["install"]);
                                            installProcess.output.pipeTo(new WritableStream({
                                                write(chunk) {
                                                    console.log("Install output:", chunk);
                                                    // Here you could also stream output to a terminal UI element
                                                }
                                            }));
                                            const installExitCode = await installProcess.exit;
                                            if (installExitCode !== 0) {
                                                console.error(`npm install failed with exit code ${installExitCode}`);
                                                // Optionally, inform the user
                                                return; // Stop if install fails
                                            }
                                            console.log("npm install completed.");
                                        } catch (error) {
                                            console.error("Error during npm install:", error);
                                            return; // Stop if spawning install fails
                                        }

                                        if (runProcess) {
                                            console.log("Killing existing run process...");
                                            runProcess.kill();
                                        }

                                        let tempRunProcess;
                                        try {
                                            console.log("Running npm start...");
                                            tempRunProcess = await webContainer.spawn("npm", ["start"]);
                                            tempRunProcess.output.pipeTo(new WritableStream({
                                                write(chunk) {
                                                    console.log("Start output:", chunk);
                                                    // Stream output to terminal UI
                                                }
                                            }));
                                            // Note: We don't typically await `tempRunProcess.exit` here for `npm start`
                                            // because it's a long-running process (the dev server).
                                            // We handle its lifecycle via `runProcess.kill()` if needed.
                                            console.log("npm start process initiated.");
                                        } catch (error) {
                                            console.error("Error during npm start:", error);
                                            return; // Stop if spawning start fails
                                        }

                                        setRunProcess(tempRunProcess);

                                        webContainer.on('server-ready', (port, url) => {
                                            console.log(`Server ready on port ${port} at ${url}`);
                                            setIframeUrl(url);
                                        });

                                        // Handle process exit, e.g., if 'npm start' crashes
                                        tempRunProcess.exit.then(code => {
                                            console.log(`npm start process exited with code ${code}`);
                                            // Optionally, clear iframe or notify user
                                            if (code !== 0 && code !== null) { // null if killed by us
                                                // setIframeUrl(null); // Example cleanup
                                            }
                                        }).catch(e => {
                                            console.error("Error waiting for npm start process exit:", e)
                                        });
                                    }}
                                    className="flex items-center gap-1 hover:bg-primary/90 px-2 py-1 rounded"
                                >
                                    <i className="ri-play-line"></i>
                                    <span>Run</span>
                                </button>
                                <span>{currentFile || 'No file selected'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>UTF-8</span>
                                <span>JavaScript</span>
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    {iframeUrl && webContainer && (
                        <div className="w-1/3 flex flex-col h-full border-l border-border bg-background">
                            <div className="p-2 border-b border-border flex items-center bg-secondary">
                                <input
                                    type="text"
                                    onChange={(e) => setIframeUrl(e.target.value)}
                                    value={iframeUrl}
                                    className="flex-grow bg-input text-foreground text-sm px-3 py-1 rounded outline-none"
                                />
                                <button
                                    onClick={() => setIframeUrl(null)}
                                    className="ml-2 p-1 text-muted-foreground hover:text-foreground"
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                            <iframe
                                src={iframeUrl}
                                className="flex-grow bg-white" /* iframe content should dictate its own bg */
                                frameBorder="0"
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* Add Collaborator Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
                    <div className="bg-card rounded-lg w-96 max-w-full border border-border shadow-xl">
                        <header className='flex justify-between items-center p-4 border-b border-border'>
                            <h2 className='text-lg font-semibold text-foreground'>Add Collaborators</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='p-1 rounded-md hover:bg-muted'
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </header>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {users.filter(u => !project.users.some(pu => pu._id === u._id)).map(user => (
                                <div
                                    key={user._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${Array.from(selectedUserId).includes(user._id) ? 'bg-primary/20 border border-primary' : 'hover:bg-muted'}`}
                                    onClick={() => handleUserClick(user._id)}
                                >
                                    <div className='w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground'>
                                        {user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className='font-medium text-foreground'>{user.email}</h3>
                                    </div>
                                    {Array.from(selectedUserId).includes(user._id) && (
                                        <i className="ri-check-line text-primary"></i>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className='p-4 border-t border-border flex justify-end'>
                            <button
                                onClick={addCollaborators}
                                disabled={selectedUserId.size === 0}
                                className={`px-4 py-2 rounded-md text-primary-foreground ${selectedUserId.size > 0 ? 'bg-primary hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'} transition-colors`}
                            >
                                Add {selectedUserId.size > 0 ? `(${selectedUserId.size})` : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project
