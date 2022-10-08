//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IPerpetualMotion {
    struct Project {
        string name;
        string description;
        address fundingAddress;
        uint256 fundingGoal;
        uint256 amountFunded;
        uint256 startTime;
        uint256 endTime;
        address[] contributorAddresses;
    }

    struct ContributerStrategy {
        Strategies strategyType;
        bytes strategyData; // Freq - Amount - blah, blah, blah
        uint256 prevDonation;
        uint256 totalDonated;
    }

    enum Strategies {
        NoStrategy,
        PeriodicLumpSum,
        Stream,
        Roundup
    }

    event ProjectCreated(
        address indexed fundingAddress,
        string name,
        string description,
        uint256 fundingGoal
    );
}
