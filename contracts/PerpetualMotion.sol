// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "./interfaces/IPerpetualMotion.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Perpetual Motion Protocol
/// @author chris, danceratopz
/// @notice A protocol that enables contributors to stream donations to
///         project creators

contract PerpetualMotionProtocol is IPerpetualMotion {
    using SafeERC20 for IERC20;

    uint256 public projectCounter;

    mapping(uint256 => mapping(address => ContributerStrategy))
        public projectToContributors;
    mapping(uint256 => Project) public projects;

    function createProject(
        string memory name,
        string memory description,
        address fundingAddress,
        uint256 fundingGoal,
        uint256 duration
    ) external {
        projects[projectCounter] = Project({
            name: name,
            description: description,
            fundingAddress: fundingAddress,
            fundingGoal: fundingGoal,
            amountFunded: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            contributorAddresses: new address[](0)
        });
        projectCounter += 1;
        emit ProjectCreated(fundingAddress, name, description, fundingGoal);
    }

    function pledge(
        uint256 _projectId,
        Strategies _strategy,
        address token,
        bytes memory _strategyData
    ) external {
        if (_strategy == Strategies.PeriodicLumpSum) {
            uint256 contribution = abi.decode(_strategyData, (uint256));
            lumpSum(_projectId, contribution, msg.sender, token);
        } else if (_strategy == Strategies.NoStrategy) {
            ContributerStrategy
                storage contributerStrategy = projectToContributors[_projectId][
                    msg.sender
                ];
            contributerStrategy.strategyType = Strategies.NoStrategy;
            contributerStrategy.strategyData = "";
        } else if (_strategy == Strategies.Stream) {
            ContributerStrategy
                storage contributerStrategy = projectToContributors[_projectId][
                    msg.sender
                ];
            contributerStrategy.strategyType = Strategies.Stream;
            contributerStrategy.strategyData = _strategyData;
        } else if (_strategy == Strategies.Roundup) {
            ContributerStrategy
                storage contributerStrategy = projectToContributors[_projectId][
                    msg.sender
                ];
            contributerStrategy.strategyType = Strategies.Roundup;
            contributerStrategy.strategyData = _strategyData;
        }
    }

    // current time - prevdonation / frequency = how much to contribute
    // execute 
    // roundup
    function stream(
        uint256 _projectId,
        address _contributor,
        address _token
    ) internal {
        // require(projectToContributors[_projectId][msg.sender].strategyType, "Not Strategy Type");
        bytes memory data = projectToContributors[_projectId][msg.sender]
            .strategyData;
        (uint256 contribution, uint256 frequency) = abi.decode(
            data,
            (uint256, uint256)
        );

        require(
            block.timestamp >= block.timestamp + frequency,
            "User has already donated"
        );
        projectToContributors[_projectId][msg.sender].prevDonation = block
            .timestamp;
        _updateContributions(_projectId, contribution, _contributor, _token);
    }

    function lumpSum(
        uint256 _projectId,
        uint256 _contribution,
        address _contributor,
        address _token
    ) internal {
        _updateContributions(_projectId, _contribution, _contributor, _token);
    }

    function _updateContributions(
        uint256 _projectId,
        uint256 _contribution,
        address _contributor,
        address _token
    ) internal {
        IERC20(_token).safeTransfer(
            projects[_projectId].fundingAddress,
            _contribution
        );
        projects[_projectId].amountFunded += _contribution;
        projectToContributors[_projectId][msg.sender]
            .totalDonated = _contribution;
    }
}
