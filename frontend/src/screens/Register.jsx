// import React, { useState, useContext } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { UserContext } from '../context/user.context'
// import axios from '../config/axios'

// const Register = () => {

//     const [ email, setEmail ] = useState('')
//     const [ password, setPassword ] = useState('')
//     const { setUser } = useContext(UserContext)
//     const navigate = useNavigate()


//     function submitHandler(e) {

//         e.preventDefault()

//         axios.post('/users/register', {
//             email,
//             password
//         }).then((res) => {
//             console.log(res.data)
//             localStorage.setItem('token', res.data.token)
//             setUser(res.data.user)
//             navigate('/login')
//         }).catch((err) => {
//             console.log(err.response.data)
//         })
//     }


//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-900">
//             <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
//                 <h2 className="text-2xl font-bold text-white mb-6">Register</h2>
//                 <form
//                     onSubmit={submitHandler}
//                 >
//                     <div className="mb-4">
//                         <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
//                         <input
//                             onChange={(e) => setEmail(e.target.value)}
//                             type="email"
//                             id="email"
//                             className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             placeholder="Enter your email"
//                         />
//                     </div>
//                     <div className="mb-6">
//                         <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
//                         <input
//                             onChange={(e) => setPassword(e.target.value)} 
//                             type="password"
//                             id="password"
//                             className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             placeholder="Enter your password"
//                         />
//                     </div>
//                     <button
//                         type="submit"
//                         className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                         Register
//                     </button>
//                 </form>
//                 <p className="text-gray-400 mt-4">
//                     Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
//                 </p>
//             </div>
//         </div>
//     )
// }

// export default Register;






import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { setUser } = useContext(UserContext)
    const navigate = useNavigate()

    function submitHandler(e) {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            alert("Passwords don't match!")
            return
        }

        axios.post('/users/register', {
            email,
            password
        }).then((res) => {
            console.log(res.data)
            localStorage.setItem('token', res.data.token)
            setUser(res.data.user)
            navigate('/login')
        }).catch((err) => {
            console.log(err.response.data)
            alert(err.response.data.message || "Registration failed")
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                {/* Left Side - Branding/Info */}
                <div className="lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Join Fluxy</h1>
                        <p className="text-blue-100">Start managing your projects professionally</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-start">
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                <i className="ri-rocket-line text-2xl text-blue-200"></i>
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Get Started Quickly</h3>
                                <p className="text-blue-100 text-sm">Set up your account in minutes and start immediately</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                <i className="ri-lock-line text-2xl text-blue-200"></i>
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Secure Data</h3>
                                <p className="text-blue-100 text-sm">Enterprise-grade security for your projects</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                <i className="ri-share-line text-2xl text-blue-200"></i>
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Easy Collaboration</h3>
                                <p className="text-blue-100 text-sm">Invite team members with just a few clicks</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Registration Form */}
                <div className="lg:w-1/2 p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-gray-400">Get started with your free account</p>
                    </div>
                    
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Email Address</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                id="email"
                                className="w-full p-3.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                id="password"
                                className="w-full p-3.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                                minLength="6"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2 text-sm font-medium">Confirm Password</label>
                            <input
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                type="password"
                                className="w-full p-3.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                                minLength="6"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full p-3.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            Create Account
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-400 hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-500 text-center">
                            By registering, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register