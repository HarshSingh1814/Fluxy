
import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
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
    const location = useLocation()
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(new Set())
    const [project, setProject] = useState(location.state.project)
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
        return (
            <div className='overflow-auto bg-gray-800 text-gray-100 rounded-lg p-3 border border-gray-700'>
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

    useEffect(() => {
        initializeSocket(project._id)

        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container)
                console.log("container started")
            })
        }

        receiveMessage('project-message', (data) => {
            console.log(data);
        
            const isAI = data?.sender?._id === 'ai';
        
            if (isAI) {
                let message = null;
        
                try {
                    message = JSON.parse(data.message);
                    console.log(message);
                } catch (err) {
                    console.error("Failed to parse message JSON:", err);
                    return; // Exit early if JSON is invalid
                }
        
                if (message?.fileTree) {
                    webContainer?.mount(message.fileTree);
                    setFileTree(message.fileTree);
                }
        
                setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
        
            } else {
                setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
            }
        });




        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
            console.log(res.data.project)
            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        axios.get('/users/all').then(res => {
            setUsers(res.data.users)
        }).catch(err => {
            console.log(err)
        })
    }, [])

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
        <main className='h-screen w-screen flex bg-gray-900 text-gray-100 overflow-hidden'>
            {/* Left Panel - Chat */}
            <section className="flex flex-col h-full w-96 bg-gray-800 border-r border-gray-700">
                <header className='flex justify-between items-center p-4 border-b border-gray-700'>
                    <h1 className='text-xl font-bold text-blue-400'>{project.name}</h1>
                    <div className='flex gap-3'>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className='p-2 rounded-md hover:bg-gray-700 transition-colors'
                            title="Add Collaborator"
                        >
                            <i className="ri-user-add-line"></i>
                        </button>
                        <button
                            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                            className='p-2 rounded-md hover:bg-gray-700 transition-colors'
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
                        className="flex-grow p-4 flex flex-col gap-3 overflow-auto scrollbar-hide scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex flex-col ${msg.sender?._id === user?._id?.toString() ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`flex items-center gap-2 mb-1 ${msg.sender?._id === user?._id?.toString() ? 'justify-end' : ''}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${msg.sender?._id === user?._id?.toString() ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                        {msg.sender?.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <small className='text-gray-400 text-xs'>{msg.sender?.email}</small>
                                </div>
                                <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender?._id === user?._id?.toString() ? 'bg-blue-600' : msg.sender?._id === 'ai' ? 'bg-gray-700' : 'bg-gray-600'}`}>
                                    {msg.sender._id === 'ai' ?
                                        WriteAiMessage(msg.message) :
                                        <p className='text-gray-100'>{msg.message}</p>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-2">
                             <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className='flex-grow bg-transparent outline-none text-gray-100 placeholder-gray-400'
                                type="text"
                                placeholder='Type a message...'
                            /> 
                             


                             <button
                                onClick={send}
                                disabled={!message.trim()}
                                className={`p-2 rounded-full ${message.trim() ? 'text-blue-400 hover:bg-blue-900/30' : 'text-gray-500'}`}
                            >
                                <i className="ri-send-plane-fill"></i>
                            </button> 
                             
                        </div>
                    </div>
                </div>

                {/* Collaborators Side Panel */}
                <div className={`absolute inset-y-0 left-0 w-80 bg-gray-800 border-r border-gray-700 z-20 shadow-xl transition-transform duration-300 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <header className='flex justify-between items-center p-4 border-b border-gray-700'>
                        <h1 className='text-lg font-semibold'>Collaborators</h1>
                        <button
                            onClick={() => setIsSidePanelOpen(false)}
                            className='p-1 rounded-md hover:bg-gray-700'
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </header>
                    <div className="p-4 space-y-3 overflow-y-auto">
                        {project.users && project.users.map((user, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                                <div className='w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white'>
                                    {/* {user.email.charAt(0).toUpperCase()} */}
                                </div>
                                <div>
                                    <h3 className='font-medium'>{user.email}</h3>
                                    <p className='text-xs text-gray-400'>Active</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Right Panel - Code Editor */}
            <section className="flex-grow flex flex-col h-full bg-gray-900">
                {/* File Explorer + Editor Container */}
                <div className="flex flex-grow overflow-hidden">
                    {/* File Explorer */}
                    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                            <h2 className='font-semibold text-gray-300'>EXPLORER</h2>
                            <button className='text-gray-400 hover:text-white'>
                                <i className="ri-add-line"></i>
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                            {Object.keys(fileTree).map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentFile(file)
                                        setOpenFiles([...new Set([...openFiles, file])])
                                    }}
                                    className={`w-full text-left p-2 px-4 flex items-center gap-2 hover:bg-gray-700 ${currentFile === file ? 'bg-gray-700 text-blue-400' : 'text-gray-300'}`}
                                >
                                    <i className={`ri-${file.includes('.') ? 'file-line' : 'folder-line'} text-yellow-400`}></i>
                                    <span className='truncate'>{file}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-grow flex flex-col bg-gray-900">
                        {/* File Tabs */}
                        <div className="flex items-center bg-gray-800 border-b border-gray-700 overflow-x-auto scrollbar-thin">
                            {openFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center border-r border-gray-700 ${currentFile === file ? 'bg-gray-900' : 'bg-gray-800'}`}
                                >
                                    <button
                                        onClick={() => setCurrentFile(file)}
                                        className={`px-4 py-2 flex items-center gap-2 ${currentFile === file ? 'text-white' : 'text-gray-400 hover:text-white'}`}
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
                                        className='p-1 mr-1 text-gray-400 hover:text-white'
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
                                    <pre className="h-full bg-gray-900">
                                        <code
                                            className="block h-full p-4 outline-none font-mono text-sm"
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
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <i className="ri-file-code-line text-4xl mb-2"></i>
                                        <p>No file selected</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status Bar */}
                        <div className="bg-blue-600 text-white px-4 py-1 text-xs flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={async () => {
                                        if (!webContainer) return

                                        await webContainer.mount(fileTree)
                                        const installProcess = await webContainer.spawn("npm", ["install"])

                                        installProcess.output.pipeTo(new WritableStream({
                                            write(chunk) {
                                                console.log(chunk)
                                            }
                                        }))

                                        if (runProcess) {
                                            runProcess.kill()
                                        }

                                        let tempRunProcess = await webContainer.spawn("npm", ["start"])
                                        tempRunProcess.output.pipeTo(new WritableStream({
                                            write(chunk) {
                                                console.log(chunk)
                                            }
                                        }))

                                        setRunProcess(tempRunProcess)

                                        webContainer.on('server-ready', (port, url) => {
                                            console.log(port, url)
                                            setIframeUrl(url)
                                        })
                                    }}
                                    className="flex items-center gap-1 hover:bg-blue-700 px-2 py-1 rounded"
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
                        <div className="w-1/3 flex flex-col h-full border-l border-gray-700 bg-gray-900">
                            <div className="p-2 border-b border-gray-700 flex items-center bg-gray-800">
                                <input
                                    type="text"
                                    onChange={(e) => setIframeUrl(e.target.value)}
                                    value={iframeUrl}
                                    className="flex-grow bg-gray-700 text-white text-sm px-3 py-1 rounded outline-none"
                                />
                                <button
                                    onClick={() => setIframeUrl(null)}
                                    className="ml-2 p-1 text-gray-400 hover:text-white"
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                            <iframe
                                src={iframeUrl}
                                className="flex-grow bg-white"
                                frameBorder="0"
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* Add Collaborator Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
                    <div className="bg-gray-800 rounded-lg w-96 max-w-full border border-gray-700 shadow-xl">
                        <header className='flex justify-between items-center p-4 border-b border-gray-700'>
                            <h2 className='text-lg font-semibold'>Add Collaborators</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='p-1 rounded-md hover:bg-gray-700'
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </header>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {users.filter(u => !project.users.some(pu => pu._id === u._id)).map(user => (
                                <div
                                    key={user._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${Array.from(selectedUserId).includes(user._id) ? 'bg-blue-900/30 border border-blue-500' : 'hover:bg-gray-700'}`}
                                    onClick={() => handleUserClick(user._id)}
                                >
                                    <div className='w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white'>
                                        {user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className='font-medium'>{user.email}</h3>
                                    </div>
                                    {Array.from(selectedUserId).includes(user._id) && (
                                        <i className="ri-check-line text-blue-400"></i>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className='p-4 border-t border-gray-700 flex justify-end'>
                            <button
                                onClick={addCollaborators}
                                disabled={selectedUserId.size === 0}
                                className={`px-4 py-2 rounded-md ${selectedUserId.size > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'} transition-colors`}
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
