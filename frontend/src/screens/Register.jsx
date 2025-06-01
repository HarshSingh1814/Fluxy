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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-card rounded-xl overflow-hidden shadow-2xl">
                {/* Left Side - Branding/Info */}
                <div className="lg:w-1/2 bg-gradient-to-br from-accent to-primary p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-primary-foreground mb-2">Join Fluxy</h1>
                        <p className="text-primary-foreground/80">Start managing your projects professionally</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-start">
                            <div className="bg-primary/20 p-2 rounded-lg mr-4">
                                <i className="ri-rocket-line text-2xl text-primary-foreground/70"></i>
                            </div>
                            <div>
                                <h3 className="text-primary-foreground font-medium mb-1">Get Started Quickly</h3>
                                <p className="text-primary-foreground/80 text-sm">Set up your account in minutes and start immediately</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="bg-primary/20 p-2 rounded-lg mr-4">
                                <i className="ri-lock-line text-2xl text-primary-foreground/70"></i>
                            </div>
                            <div>
                                <h3 className="text-primary-foreground font-medium mb-1">Secure Data</h3>
                                <p className="text-primary-foreground/80 text-sm">Enterprise-grade security for your projects</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="bg-primary/20 p-2 rounded-lg mr-4">
                                <i className="ri-share-line text-2xl text-primary-foreground/70"></i>
                            </div>
                            <div>
                                <h3 className="text-primary-foreground font-medium mb-1">Easy Collaboration</h3>
                                <p className="text-primary-foreground/80 text-sm">Invite team members with just a few clicks</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Registration Form */}
                <div className="lg:w-1/2 p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
                        <p className="text-muted-foreground">Get started with your free account</p>
                    </div>
                    
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label className="block text-muted-foreground mb-2 text-sm font-medium">Email Address</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                id="email"
                                className="w-full p-3.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-muted-foreground mb-2 text-sm font-medium">Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                id="password"
                                className="w-full p-3.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                                placeholder="••••••••"
                                required
                                minLength="6"
                            />
                        </div>

                        <div>
                            <label className="block text-muted-foreground mb-2 text-sm font-medium">Confirm Password</label>
                            <input
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                type="password"
                                className="w-full p-3.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                                placeholder="••••••••"
                                required
                                minLength="6"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full p-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                        >
                            Create Account
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-xs text-muted-foreground/70 text-center">
                            By registering, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
