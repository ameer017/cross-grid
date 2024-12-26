// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract UserManagement {
    enum UserType { Producer, Consumer }

    struct UserProfile {
        UserType userType;
        address walletAddress;
        string name;
        string preferences;
        uint256 createdAt;
    }

    mapping(address => UserProfile) private userProfiles;
    address[] private registeredUsers;


    event UserRegistered(address indexed user, UserType userType, string name, uint256 timestamp);
    event PreferencesUpdated(address indexed user, string newPreferences, uint256 timestamp);

    modifier onlyRegistered() {
        require(isRegistered(msg.sender), "User is not registered");
        _;
    }

 
    function registerUser(UserType userType, string memory name, string memory preferences) external {
        require(!isRegistered(msg.sender), "User is already registered");

        userProfiles[msg.sender] = UserProfile({
            userType: userType,
            walletAddress: msg.sender,
            name: name,
            preferences: preferences,
            createdAt: block.timestamp
        });

        registeredUsers.push(msg.sender);
        emit UserRegistered(msg.sender, userType, name, block.timestamp);
    }

    
    function updatePreferences(string memory newPreferences) external onlyRegistered {
        userProfiles[msg.sender].preferences = newPreferences;
        emit PreferencesUpdated(msg.sender, newPreferences, block.timestamp);
    }


    function getUserProfile(address userAddress) external view onlyRegistered returns (UserProfile memory) {
        require(isRegistered(userAddress), "User not found");
        return userProfiles[userAddress];
    }

    function isRegistered(address userAddress) public view returns (bool) {
        return userProfiles[userAddress].walletAddress != address(0);
    }

 
    function getAllUsers() external view returns (address[] memory) {
        return registeredUsers;
    }

    function getUserType(address userAddress) external view onlyRegistered returns (UserType) {
        require(isRegistered(userAddress), "User not found");
        return userProfiles[userAddress].userType;
    }
}
