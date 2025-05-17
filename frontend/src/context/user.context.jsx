
import React, { createContext, useState, useEffect } from 'react';
import axios from '../config/axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading to wait for user fetch

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await axios.get('/users/profile', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUser(res.data.user); // Server se milne wala user object
                }
            } catch (err) {
                console.log('User auto-login failed:', err.message);
                sessionStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return <div className="text-white text-center mt-20">Loading...</div>;
    }

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};





// import React, { createContext, useState, useEffect } from 'react';
// import axios from '../config/axios';

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchProfile = async () => {
//             try {
//                 const token = sessionStorage.getItem('token');  // Changed from localStorage to sessionStorage
//                 if (token) {
//                     const res = await axios.get('/users/profile', {
//                         headers: {
//                             Authorization: `Bearer ${token}`
//                         }
//                     });
//                     setUser(res.data.user);
//                 }
//             } catch (err) {
//                 console.log('Auto-login failed:', err.message);
//                 sessionStorage.removeItem('token');  // Changed from localStorage to sessionStorage
//                 setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProfile();
//     }, []);

//     if (loading) {
//         return <div className="text-white text-center mt-20">Loading...</div>;
//     }

//     return (
//         <UserContext.Provider value={{ user, setUser }}>
//             {children}
//         </UserContext.Provider>
//     );
//};



// import React, { createContext, useState, useEffect } from 'react';
// import axios from '../config/axios';

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchProfile = async () => {
//             try {
//                 const token = sessionStorage.getItem('token');  // Changed from localStorage to sessionStorage
//                 if (token) {
//                     const res = await axios.get('/users/profile', {
//                         headers: {
//                             Authorization: `Bearer ${token}`
//                         }
//                     });
//                     setUser(res.data.user);
//                 }
//             } catch (err) {
//                 console.log('Auto-login failed:', err.message);
//                 sessionStorage.removeItem('token');  // Changed from localStorage to sessionStorage
//                 setUser(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProfile();
//     }, []);

//     if (loading) {
//         return <div className="text-white text-center mt-20">Loading...</div>;
//     }

//     return (
//         <UserContext.Provider value={{ user, setUser }}>
//             {children}
//         </UserContext.Provider>
//     );
// };