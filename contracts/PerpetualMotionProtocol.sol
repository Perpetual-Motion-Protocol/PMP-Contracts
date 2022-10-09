// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "./interfaces/IPerpetualMotion.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Stream.sol";

/// @title Perpetual Motion Protocol
/// @author chris, danceratopz
/// @notice A protocol that enables contributors to stream donations to
///         project creators

contract PerpetualMotionProtocol is IPerpetualMotion, Stream {
    using SafeERC20 for IERC20;

    uint256 public projectCounter;

    mapping(bytes => bool) public txHashes;
    mapping(uint256 => mapping(address => ContributerStrategy))
        public projectToContributors;
    mapping(uint256 => Project) public projects;

    function createProject(
        string memory name,
        string memory description,
        address fundingAddress,
        address fundingToken,
        uint256 fundingGoal,
        uint256 duration
    ) external {
        projects[projectCounter] = Project({
            name: name,
            description: description,
            fundingAddress: fundingAddress,
            fundingGoal: fundingGoal,
            fundingToken: fundingToken,
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
        bytes memory _strategyData
    ) external {
        if (_strategy == Strategies.PeriodicLumpSum) {
            uint256 contribution = abi.decode(_strategyData, (uint256));
            lumpSum(
                _projectId,
                contribution,
                msg.sender,
                projects[_projectId].fundingToken
            );
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
            contributerStrategy.prevDonation = block.timestamp;
        } else if (_strategy == Strategies.Roundup) {
            ContributerStrategy
                storage contributerStrategy = projectToContributors[_projectId][
                    msg.sender
                ];
            contributerStrategy.strategyType = Strategies.Roundup;
            contributerStrategy.strategyData = _strategyData;
        }
        emit PledgeCreated(_projectId, _strategy, _strategyData);
    }

    function execute(
        uint256[] memory _projectIds,
        address[][] memory _contributers,
        bytes[][] memory _roundUpDatas
    ) external {
        for (uint256 i; i < _projectIds.length; i++) {
            for (uint256 j; j < _contributers[i].length; j++) {
                Strategies strategy = projectToContributors[_projectIds[i]][
                    _contributers[i][j]
                ].strategyType;
                if (strategy == Strategies.NoStrategy) {
                    continue;
                } else if (strategy == Strategies.Stream) {
                    stream(_projectIds[i], _contributers[i][j]);
                } else if (strategy == Strategies.Roundup) {
                    (bytes memory txHash, uint256 contribution) = abi.decode(
                        _roundUpDatas[i][j],
                        (bytes, uint256)
                    );
                    roundUp(
                        _projectIds[i],
                        _contributers[i][j],
                        txHash,
                        contribution
                    );
                }
                if (
                    projects[_projectIds[i]].amountFunded >=
                    projects[_projectIds[i]].fundingGoal
                ) {
                    IERC20(projects[_projectIds[i]].fundingToken).safeTransfer(
                        projects[_projectIds[i]].fundingAddress,
                        projects[_projectIds[i]].amountFunded
                    );
                    break;
                }
            }
        }
        emit Executed(_projectIds, _contributers, _roundUpDatas);
    }

    function returnFundingGoal(uint256 _projectId)
        public
        view
        returns (uint256)
    {
        return projects[_projectId].fundingGoal;
    }

    function returnAmountFunded(uint256 _projectId)
        public
        view
        returns (uint256)
    {
        return projects[_projectId].amountFunded;
    }

    function returnUserDonations(uint256 _projectId, address _contributor)
        public
        view
        returns (uint256)
    {
        return projectToContributors[_projectId][_contributor].totalDonated;
    }

    function returnUserStrategy(uint256 _projectId, address _contributor)
        public
        view
        returns (Strategies)
    {
        return projectToContributors[_projectId][_contributor].strategyType;
    }

    function roundUp(
        uint256 _projectId,
        address _contributor,
        bytes memory txHash,
        uint256 contribution
    ) internal {
        require(!txHashes[txHash], "Hash already used");
        txHashes[txHash] = true;
        _updateContributions(
            _projectId,
            contribution,
            _contributor,
            projects[_projectId].fundingToken
        );
    }

    function stream(uint256 _projectId, address _contributor) internal {
        bytes memory data = projectToContributors[_projectId][_contributor]
            .strategyData;
        (uint256 contribution, uint256 frequency) = abi.decode(
            data,
            (uint256, uint256)
        );
        uint256 prevDonation = projectToContributors[_projectId][_contributor]
            .prevDonation;

        uint256 totalContribution = contribution *
            ((block.timestamp - prevDonation) / frequency);

        projectToContributors[_projectId][msg.sender].prevDonation = block
            .timestamp;
        _updateContributions(
            _projectId,
            totalContribution,
            _contributor,
            projects[_projectId].fundingToken
        );
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
        IERC20(_token).safeTransferFrom(
            _contributor,
            address(this),
            _contribution
        );
        projects[_projectId].amountFunded += _contribution;
        projects[_projectId].contributorAddresses.push(_contributor);
        projectToContributors[_projectId][_contributor]
            .totalDonated += _contribution;
        emit ContributionUpdated(
            _projectId,
            _contribution,
            _contributor,
            _token
        );
    }
}
