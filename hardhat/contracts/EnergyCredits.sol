// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract EnergyCredits {
    string public tokenName = "EthGrid";
    string public tokenSymbol = "ETC";
    uint256 public totalSupply;
    uint8 public constant decimals = 18;
    address public owner;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    bool private locked;

    event Transfer(
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );
    event Mint(address indexed recipient, uint256 amount);
    event Burn(address indexed account, uint256 amount);

    modifier noReentrancy() {
        require(!locked, "No reentrancy allowed");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        _mint(owner, 1_000_000_000 * (10 ** decimals));
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function transfer(
        address recipient,
        uint256 amount
    ) external noReentrancy returns (bool) {
        require(recipient != address(0), "Receiver address cannot be zero");
        require(amount <= balances[msg.sender], "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[recipient] += amount;

        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "Spender address cannot be zero");

        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(
        address account,
        address spender
    ) external view returns (uint256) {
        return allowances[account][spender];
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external noReentrancy returns (bool) {
        require(sender != address(0), "Sender address cannot be zero");
        require(recipient != address(0), "Receiver address cannot be zero");
        require(amount <= balances[sender], "Insufficient balance of sender");
        require(amount <= allowances[sender][msg.sender], "Allowance exceeded");

        balances[sender] -= amount;
        allowances[sender][msg.sender] -= amount;
        balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
        return true;
    }

    function burn(uint256 amount) external onlyOwner {
        require(amount <= balances[msg.sender], "Insufficient balance to burn");

        balances[msg.sender] -= amount;
        totalSupply -= amount;

        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    function mint(uint256 amount, address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        _mint(recipient, amount);
    }

    function _mint(address recipient, uint256 amount) internal {
        balances[recipient] += amount;
        totalSupply += amount;

        emit Mint(recipient, amount);
        emit Transfer(address(0), recipient, amount);
    }
}
