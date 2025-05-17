
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
        <main className="min-h-screen p-6 bg-gray-900 text-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Fluxy
                    </h1>
                    <p className="text-gray-400 mt-1 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        Welcome , <span className="font-medium text-blue-300 ml-1">{user?.email || 'User'}</span>
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all border border-gray-700 hover:border-gray-600"
                >
                    <i className="ri-logout-box-r-line"></i>
                    Sign Out
                </button>
            </div>

            {/* Project List */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-300 flex items-center">
                        <i className="ri-folder-2-line mr-3 text-blue-400"></i>
                        My Projects
                    </h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/20"
                    >
                        <i className="ri-add-line"></i>
                        New Project
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {project.map((project) => (
                            <div
                                key={project._id}
                                className="bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-700 hover:border-blue-500/30 hover:translate-y-[-2px] group"
                            >
                                <div className="h-full flex flex-col">
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3
                                                onClick={() => navigate(`/project`, { state: { project } })}
                                                className="text-lg font-medium text-gray-100 hover:text-blue-400 cursor-pointer line-clamp-2 group-hover:text-blue-400 transition-colors"
                                            >
                                                {project.name}
                                            </h3>
                                            <span className="bg-blue-900/50 text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-800/50">
                                                {project.status || 'Active'}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-400 text-sm mb-4">
                                            <i className="ri-team-line mr-2 text-blue-400"></i>
                                            <span>{project.users.length} {project.users.length === 1 ? 'Member' : 'Members'}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                                        <span className="text-xs text-gray-500">
                                            {new Date(project.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <button
                                            onClick={() => deleteProject(project._id)}
                                            className="text-gray-400 hover:text-red-400 transition-colors p-1 hover:bg-gray-700 rounded"
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
                    <div className="bg-gray-800 w-full max-w-md p-6 rounded-xl border border-gray-700 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-semibold text-gray-100">
                                <i className="ri-rocket-line mr-2 text-blue-400"></i>
                                Create New Project
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>
                        <form onSubmit={createProject}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-100 placeholder-gray-500"
                                    placeholder="e.g. Quantum Leap Initiative"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20"
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
