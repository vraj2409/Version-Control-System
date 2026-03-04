const getAllUsers = (req, res) => {
    res.send("all users fetched!");
}

const signup = (req, res) => {
    res.send("user signing up!");
}

const login = (req, res) => {
    res.send("user logged in!");
}

const getUserProfile = (req, res) => {
    res.send("user profile fetched!");
}

const updateUserProfile = (req, res) => {
    res.send("user profile updated!");
}

const deleteUserProfile = (req, res) => {
    res.send("user profile deleted!");
}

module.exports = {
    getAllUsers,
    signup, 
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
}