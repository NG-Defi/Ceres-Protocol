// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import '../../Math/Math.sol';
import '../../Math/SafeMath.sol';
import '../../ERC20/IERC20.sol';
import '../../Utils/Address.sol';
import '../../ERC20/SafeERC20.sol';
import '../../Interfaces/IRewardDistributionRecipient.sol';
import '../../ERC20/LPTokenWrapper.sol';
import '../../Utils/PoolLock.sol';
import '../../owner/Operator.sol';

contract CSSWETHPool is
    LPTokenWrapper,
    IRewardDistributionRecipient,
    PoolLock
{
    IERC20 public CSS;
    address public foundationA; //TEST CASES DONE
    uint256 public basAllocationPercentage = 1; // TEST CASES DONE
    uint256 public DURATION = 5 days; // TEST CASES DONE

    uint256 public startime; //TEST CASES DONE 
    uint256 public periodFinish = 0; //TEST CASES DONE
    uint256 public rewardRate = 0; //TEST CASES DONE
    uint256 public lastUpdateTime; //TEST CASES DONE
    uint256 public rewardPerTokenStored; //TEST CASES DONE
    mapping(address => uint256) public userRewardPerTokenPaid; //TEST CASES DONE
    mapping(address => uint256) public rewards; //TEST CASES DONE

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    // TEST CASES DONE
    constructor(
        address _css,
        address lptoken_,
        address foundationA_,
        uint256 _startime
    ) public {
        CSS = IERC20(_css);
        lpt = IERC20(lptoken_);
        foundationA = foundationA_;
        startime = _startime;
    }

    modifier checkStart() {
        require(
            block.timestamp >= startime,
            'DAIBACLPTokenCashPool: not start'
        );
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        // TODO: [IMPORTANT][ADDED CODE] TO TUNING THE LASTUPDATETIME MECHANISM
        // lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    // TEST CASES DONE
    function lastTimeRewardApplicable() public view returns (uint256) {
        // TODO: [IMPORTANT][ADDED CODE] TO TUNING THE LASTUPDATETIME MECHANISM
        // return Math.min(block.timestamp, periodFinish);
        if (periodFinish>0) 
            return periodFinish;
        else 
            return block.timestamp;
    }
    // TEST CASES DONE
    // TODO: ADD onlyOperator after developing
    function setRewardRate(uint256 _rewardRate) public {
        rewardRate = _rewardRate;
        if (block.timestamp > startime) {
            lastUpdateTime = block.timestamp;
            periodFinish = block.timestamp.add(DURATION);
        } else {
            lastUpdateTime = startime;
            periodFinish = startime.add(DURATION);
        }
    }
    // TEST CASES DONE
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }
    // TEST CASES DONE
    function earned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    // stake visibility is public as overriding LPTokenWrapper's stake() function
    // TEST CASES DONE
    function stake(uint256 amount)
        public
        override
        updateReward(msg.sender)
        checkStart
    {
        require(amount > 0, 'DAIBACLPTokenCashPool: Cannot stake 0');
        super.stake(amount);
        // TODO: ADD CODE FOR SETLOCKTIME()
        // setLockTime();
        emit Staked(msg.sender, amount);
    }
    // TEST CASES DONE
    function withdraw(uint256 amount)
        public
        override
        updateReward(msg.sender)
        checkStart
    {
        require(amount > 0, 'DAIBACLPTokenCashPool: Cannot withdraw 0');
        // TODO: ADD CODE FOR LOCKUP
        // require(canWithdraw(msg.sender), "BACWOKT: still in withdraw lockup");
        // setLockTime();
        super.withdraw(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function exit() external {
        withdraw(balanceOf(msg.sender));
        getReward();
    }
    // TEST CASES DONE
    function getReward() public updateReward(msg.sender) checkStart {
        uint256 reward = earned(msg.sender);
        if (reward > 0) {
            require(canWithdraw(msg.sender), "BACWOKT: still in reward lockup");
            setLockTime();
            rewards[msg.sender] = 0;
            CSS.safeTransfer(msg.sender, reward.mul(100-basAllocationPercentage).div(100));
            uint256 totalFee = reward.mul(basAllocationPercentage).div(100);
            CSS.safeTransfer(foundationA, totalFee);
            
            emit RewardPaid(msg.sender, reward);
        }
    }

    // function notifyRewardAmount(uint256 reward)
    //     external
    //     override
    //     onlyRewardDistribution
    //     updateReward(address(0))
    // {
    //     if (block.timestamp > startime) {
    //         if (block.timestamp >= periodFinish) {
    //             rewardRate = reward.div(DURATION);
    //         } else {
    //             uint256 remaining = periodFinish.sub(block.timestamp);
    //             uint256 leftover = remaining.mul(rewardRate);
    //             rewardRate = reward.add(leftover).div(DURATION);
    //         }
    //         lastUpdateTime = block.timestamp;
    //         periodFinish = block.timestamp.add(DURATION);
    //         emit RewardAdded(reward);
    //     } else {
    //         rewardRate = reward.div(DURATION);
    //         lastUpdateTime = startime;
    //         periodFinish = startime.add(DURATION);
    //         emit RewardAdded(reward);
    //     }
    // }
}
