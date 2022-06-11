// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./CafeContract.sol";

error CafeRegistry__OnlyEligible();
error CafeRegistry__InputItemsDataMustHaveSameLength();
error CafeRegistry__InputMembershipDataMustHaveSameLength();

contract CafeRegistry {
    address private owner;

    struct CafeInfo {
        // item to its price
        mapping(string => uint256) menu;
        // item to reward in amount of Cafe Tokens
        mapping(string => uint256) rewards;
        // membership level to all time discounts in percentage
        mapping(uint256 => uint256) membershipDiscounts;
        mapping(uint256 => uint256) membershipDiscountsThresholds;
        uint256 totalNumberOfMemberships;
        uint256 oneTimeDiscountThreshold; // in cafe tokens
        uint256 oneTimeDiscount; // in eth
    }

    // cafe contract address => CafeInfo
    mapping(address => CafeInfo) public cafeInfo;

    mapping(address => bool) public cafeContracts;
    // cafe contract address => cafe payment receiver;
    mapping(address => address) public cafePaymentReceivers;
    // cafe contract to eligible addresses
    mapping(address => mapping(address => bool)) eligibleAddresses;

    constructor() {
        owner = msg.sender;
    }

    function getMembershipDiscount(
        address _cafeContract,
        uint256 _membershipLevel
    ) public view returns (uint256) {
        return cafeInfo[_cafeContract].membershipDiscounts[_membershipLevel];
    }

    function getTotalNumberOfMemberships(address _cafeContract)
        public
        view
        returns (uint256)
    {
        return cafeInfo[_cafeContract].totalNumberOfMemberships;
    }

    function getOneTimeDiscountThreshold(address _cafeContract)
        public
        view
        returns (uint256)
    {
        return cafeInfo[_cafeContract].oneTimeDiscountThreshold;
    }

    function getOneTimeDiscount(address _cafeContract)
        public
        view
        returns (uint256)
    {
        return cafeInfo[_cafeContract].oneTimeDiscount;
    }

    function getMenuItemReward(address _cafeContract, string calldata _item)
        public
        view
        returns (uint256)
    {
        return cafeInfo[_cafeContract].rewards[_item];
    }

    function getMenuItemPrice(address _cafeContract, string calldata _item)
        public
        view
        returns (uint256)
    {
        return cafeInfo[_cafeContract].menu[_item];
    }

    modifier onlyEligible(address _cafeContract) {
        if (
            msg.sender == owner ||
            (eligibleAddresses[_cafeContract][msg.sender]) == true
        ) revert CafeRegistry__OnlyEligible();
        _;
    }

    function createCafeContract(
        string[] memory menuItems,
        uint256[] memory itemPrices,
        uint256[] memory itemRewards,
        uint256[] memory membershipLevels,
        uint256[] memory membershipDiscounts,
        uint256[] memory membershipDiscountThresholds,
        uint256 oneTimeDiscountThreshold,
        uint256 oneTimeDiscount,
        address _paymentReceiver,
        address _cafeOwnerRole
    ) public returns (address) {
        // TODO: check if contract has been successfully deployed?
        CafeContract newCafeContract = new CafeContract(
            msg.sender,
            _cafeOwnerRole
        );
        address _newCafeContractAddress = address(newCafeContract);
        // add msg.sender to eligibleAddresses
        eligibleAddresses[_newCafeContractAddress][msg.sender] = true;
        // set the contract payment receiver
        cafePaymentReceivers[_newCafeContractAddress] = _paymentReceiver;
        // add items to CafeInfo Struct
        // check lengths:
        // add items to menu and rewards
        if (
            menuItems.length == itemPrices.length &&
            itemPrices.length == itemRewards.length
        ) {
            for (uint256 i = 0; i < menuItems.length; i++) {
                cafeInfo[_newCafeContractAddress].menu[
                    menuItems[i]
                ] = itemPrices[i];
                cafeInfo[_newCafeContractAddress].rewards[
                    menuItems[i]
                ] = itemRewards[i];
            }
        } else {
            revert CafeRegistry__InputItemsDataMustHaveSameLength();
        }
        // add membership info
        if (
            membershipLevels.length == membershipDiscounts.length &&
            membershipDiscounts.length == membershipDiscountThresholds.length
        ) {
            cafeInfo[_newCafeContractAddress]
                .totalNumberOfMemberships = membershipLevels.length;
            for (uint256 i = 0; i < membershipLevels.length; i++) {
                cafeInfo[_newCafeContractAddress].membershipDiscountsThresholds[
                        membershipLevels[i]
                    ] = membershipDiscountThresholds[i];
                cafeInfo[_newCafeContractAddress].membershipDiscounts[
                        membershipLevels[i]
                    ] = membershipDiscounts[i];
            }
        } else {
            revert CafeRegistry__InputMembershipDataMustHaveSameLength();
        }

        // add one time rewards
        cafeInfo[_newCafeContractAddress].oneTimeDiscount = oneTimeDiscount;
        cafeInfo[_newCafeContractAddress]
            .oneTimeDiscountThreshold = oneTimeDiscountThreshold;

        return _newCafeContractAddress;
    }

    // TODO: create functions to update menu, rewards, memberships etc.;
}
