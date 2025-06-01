import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const { user, setUser } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState(null)
    const [project, setProject] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        axios.post('/projects/create', { name: projectName })
            .then((res) => {
                setIsModalOpen(false)
                setProjectName("")
                // Optional: Refresh project list
                setProject(prev => [...prev, res.data.project])
            })
            .catch((error) => console.log(error))
    }

    //  Fixed logout function
    function logout() {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token') // 🛠️ This line fixes the auto re-login issue
        navigate('/login')
    }

    function deleteProject(projectId) {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?")
        if (!confirmDelete) return

        axios.delete(`/projects/delete/${projectId}`)
            .then(() => {
                setProject(prev => prev.filter(p => p._id !== projectId))
            })
            .catch((err) => {
                console.log(err)
                alert("Failed to delete project")
            })
    }

    useEffect(() => {
        axios.get('/projects/all')
            .then((res) => {
                setProject(res.data.projects)
                setIsLoading(false)
            })
            .catch(err => {
                console.log(err)
                setIsLoading(false)
            })
    }, [])

    return (
        <main className="min-h-screen p-6 bg-background text-foreground">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-border">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Fluxy
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span> {/* Kept green for status */}
                        Welcome , <span className="font-medium text-primary ml-1">{user?.email || 'User'}</span>
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg transition-all border border-border hover:border-border/80"
                >
                    <i className="ri-logout-box-r-line"></i>
                    Sign Out
                </button>
            </div>

            {/* Project List */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-foreground flex items-center">
                        <i className="ri-folder-2-line mr-3 text-primary"></i>
                        My Projects
                    </h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-primary/20"
                    >
                        <i className="ri-add-line"></i>
                        New Project
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {project.map((project) => (
                            <div
                                key={project._id}
                                className="bg-card p-5 rounded-xl shadow-lg hover:shadow-xl transition-all border border-border hover:border-primary/30 hover:translate-y-[-2px] group"
                            >
                                <div className="h-full flex flex-col">
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3
                                                onClick={() => navigate(`/project`, { state: { project } })}
                                                className="text-lg font-medium text-foreground hover:text-primary cursor-pointer line-clamp-2 group-hover:text-primary transition-colors"
                                            >
                                                {project.name}
                                            </h3>
                                            <span className="bg-primary/20 text-primary text-xs px-2.5 py-1 rounded-full border border-primary/30">
                                                {project.status || 'Active'}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground text-sm mb-4">
                                            <i className="ri-team-line mr-2 text-primary"></i>
                                            <span>{project.users.length} {project.users.length === 1 ? 'Member' : 'Members'}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-border">
                                        <span className="text-xs text-muted-foreground/70">
                                            {new Date(project.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <button
                                            onClick={() => deleteProject(project._id)}
                                            className="text-muted-foreground hover:text-red-500 transition-colors p-1 hover:bg-muted rounded"
                                            title="Delete project"
                                        >
                                            <i className="ri-delete-bin-6-line text-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-semibold text-foreground">
                                <i className="ri-rocket-line mr-2 text-primary"></i>
                                Create New Project
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>
                        <form onSubmit={createProject}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all text-foreground placeholder-muted-foreground"
                                    placeholder="e.g. Quantum Leap Initiative"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-muted-foreground bg-secondary rounded-lg hover:bg-muted transition-colors border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20"
                                >
                                    <i className="ri-add-line"></i>
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home
