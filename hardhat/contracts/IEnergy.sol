// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IEnergy Interface
/// @notice Defines the standard interface for an energy token, including essential ERC-20 functions.
/// @dev This interface is designed to facilitate interaction with energy-based token systems.
interface IEnergy {
    /// @notice Emitted when a transfer of tokens occurs.
    /// @param from The address from which tokens were transferred.
    /// @param to The address to which tokens were transferred.
    /// @param value The amount of tokens transferred.
    event Transfer(address indexed from, address indexed to, uint256 value);

    /// @notice Emitted when an approval is set for a spender.
    /// @param owner The address of the token owner granting the allowance.
    /// @param spender The address of the spender receiving the allowance.
    /// @param value The amount of tokens approved for spending.
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /// @notice Gets the total supply of tokens in circulation.
    /// @return The total number of tokens available.
    function totalSupply() external view returns (uint256);

    /// @notice Retrieves the token balance of a specific account.
    /// @param account The address of the account to query.
    /// @return The balance of the specified account.
    function balanceOf(address account) external view returns (uint256);

    /// @notice Transfers a specified amount of tokens to a given address.
    /// @param to The address of the recipient.
    /// @param value The amount of tokens to transfer.
    /// @return A boolean indicating whether the operation succeeded.
    function transfer(address to, uint256 value) external returns (bool);

    /// @notice Gets the remaining number of tokens a spender is allowed to use on behalf of an owner.
    /// @param owner The address of the token owner.
    /// @param spender The address of the spender.
    /// @return The remaining allowance for the spender.
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    /// @notice Approves a spender to use a specified amount of tokens on behalf of the caller.
    /// @param spender The address authorized to spend the tokens.
    /// @param value The amount of tokens approved for spending.
    /// @return A boolean indicating whether the operation succeeded.
    function approve(address spender, uint256 value) external returns (bool);

    /// @notice Transfers tokens from one address to another, using an approved allowance.
    /// @param from The address from which tokens are to be transferred.
    /// @param to The address to which tokens are to be transferred.
    /// @param value The amount of tokens to transfer.
    /// @return A boolean indicating whether the operation succeeded.
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}
