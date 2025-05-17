
import React, { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { user, setUser } = useContext(UserContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate]);

    function submitHandler(e) {
        e.preventDefault()

        axios.post('/users/login', {
            email,
            password
        }).then((res) => {
            localStorage.setItem('token', res.data.token)
            setUser(res.data.user)
            navigate('/')
        }).catch((err) => {
            console.log(err.response.data)
            alert(err.response.data.message || "Login failed")
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                {/* Left Side - Branding/Info */}
                <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Fluxy</h1>
                        <p className="text-blue-100">Your professional project management solution</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-start">
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                <i className="ri-team-line text-2xl text-blue-200"></i>
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Collaborate Efficiently</h3>
                                <p className="text-blue-100 text-sm">Work seamlessly with your team members in real-time</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                <i className="ri-bar-chart-line text-2xl text-blue-200"></i>
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Track Progress</h3>
                                <p className="text-blue-100 text-sm">Monitor your project milestones and deadlines</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                <i className="ri-shield-keyhole-line text-2xl text-blue-200"></i>
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Secure Platform</h3>
                                <p className="text-blue-100 text-sm">Your data is protected with enterprise-grade security</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="lg:w-1/2 p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">Sign in to access your projects</p>
                    </div>
                    
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Email Address</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className="w-full p-3.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-gray-300 text-sm font-medium">Password</label>
                                <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">Forgot password?</Link>
                            </div>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                className="w-full p-3.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full p-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all hover:shadow-lg hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            Sign In
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-400 hover:underline font-medium">
                                Create account
                            </Link>
                        </p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-500 text-center">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login





// import React, { useState, useContext, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import axios from '../config/axios'
// import { UserContext } from '../context/user.context'

// const Login = () => {
//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//     const { user, setUser } = useContext(UserContext)
//     const navigate = useNavigate()

//     useEffect(() => {
//         if (user) {
//             navigate('/')
//         }
//     }, [user, navigate])

//     const generateSessionId = () => {
//         return Date.now().toString() + Math.random().toString(36).substring(2)
//     }

//     const submitHandler = (e) => {
//         e.preventDefault()

//         axios.post('/users/login', {
//             email,
//             password
//         }).then((res) => {
//             const sessionId = generateSessionId()
//             sessionStorage.setItem(`token-${sessionId}`, res.data.token)
//             setUser(res.data.user)
//             navigate(`/?sessionId=${sessionId}`)
//         }).catch((err) => {
//             console.log(err.response?.data)
//             alert(err.response?.data?.message || "Login failed")
//         })
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
//             <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
//                 {/* Left Side - Branding/Info */}
//                 <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex flex-col justify-center">
//                     <div className="mb-8">
//                         <h1 className="text-4xl font-bold text-white mb-2">Fluxy</h1>
//                         <p className="text-blue-100">Your professional project management solution</p>
//                     </div>

//                     <div className="space-y-6">
//                         <div className="flex items-start">
//                             <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
//                                 <i className="ri-team-line text-2xl text-blue-200"></i>
//                             </div>
//                             <div>
//                                 <h3 className="text-white font-medium mb-1">Collaborate Efficiently</h3>
//                                 <p className="text-blue-100 text-sm">Work seamlessly with your team members in real-time</p>
//                             </div>
//                         </div>

//                         <div className="flex items-start">
//                             <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
//                                 <i className="ri-bar-chart-line text-2xl text-blue-200"></i>
//                             </div>
//                             <div>
//                                 <h3 className="text-white font-medium mb-1">Track Progress</h3>
//                                 <p className="text-blue-100 text-sm">Monitor your project milestones and deadlines</p>
//                             </div>
//                         </div>

//                         <div className="flex items-start">
//                             <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
//                                 <i className="ri-shield-keyhole-line text-2xl text-blue-200"></i>
//                             </div>
//                             <div>
//                                 <h3 className="text-white font-medium mb-1">Secure Platform</h3>
//                                 <p className="text-blue-100 text-sm">Your data is protected with enterprise-grade security</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right Side - Login Form */}
//                 <div className="lg:w-1/2 p-12 flex flex-col justify-center">
//                     <div className="mb-8 text-center lg:text-left">
//                         <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
//                         <p className="text-gray-400">Sign in to access your projects</p>
//                     </div>

//                     <form onSubmit={submitHandler} className="space-y-6">
//                         <div>
//                             <label className="block text-gray-300 mb-2 text-sm font-medium">Email Address</label>
//                             <input
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 type="email"
//                                 className="w-full p-3.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                                 placeholder="your@email.com"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <div className="flex justify-between items-center mb-2">
//                                 <label className="block text-gray-300 text-sm font-medium">Password</label>
//                                 <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">Forgot password?</Link>
//                             </div>
//                             <input
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 type="password"
//                                 className="w-full p-3.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                                 placeholder="••••••••"
//                                 required
//                             />
//                         </div>

//                         <button
//                             type="submit"
//                             className="w-full p-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all hover:shadow-lg hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
//                         >
//                             Sign In
//                         </button>
//                     </form>

//                     <div className="mt-8 text-center">
//                         <p className="text-gray-400">
//                             Don't have an account?{' '}
//                             <Link to="/register" className="text-blue-400 hover:underline font-medium">
//                                 Create account
//                             </Link>
//                         </p>
//                     </div>

//                     <div className="mt-8 pt-6 border-t border-gray-700">
//                         <p className="text-xs text-gray-500 text-center">
//                             By continuing, you agree to our Terms of Service and Privacy Policy
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Login
