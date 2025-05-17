// import React, { useEffect, useContext } from 'react'
// import AppRoutes from './routes/AppRoutes'
// import { UserProvider, UserContext } from './context/user.context'
// import axios from './config/axios'

// const AppContent = () => {
//   const { user, setUser } = useContext(UserContext)

//   useEffect(() => {
//     const token = localStorage.getItem('token')

//     if (token && !user) {
//       axios
//         .get('/users/profile', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         })
//         .then((res) => {
//           setUser(res.data.user)
//         })
//         .catch(() => {
//           localStorage.removeItem('token')
//         })
//     }
//   }, [user, setUser])

//   return <AppRoutes />
// }

// const App = () => {
//   return (
//     <UserProvider>
//       <AppContent />
//     </UserProvider>
//   )
// }

// export default App


import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'

const App = () => {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}

export default App