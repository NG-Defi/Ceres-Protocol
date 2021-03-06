// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import '../Math/SafeMath.sol';
import '../ERC20/SafeERC20.sol';
import '../ERC20/IERC20.sol';

contract LPTokenWrapper {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    // TEST CASES DONE
    IERC20 public lpt;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    // TEST CASES DONE
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    // TEST CASES DONE
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function stake(uint256 amount) public virtual {
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        lpt.safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) public virtual {
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        lpt.safeTransfer(msg.sender, amount);
    }
}
