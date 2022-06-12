// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./CafeRegistry.sol";
import "./CafeContract.sol";

error CafeCore__CafeContractNotInRegistry();
error CafeCore__ItemNotInMenu();
error CafeCore__WrongAmountOfEth();
error CafeCore__ArraysLengthsNotSame();

contract CafeCore {
    CafeRegistry public cafeRegistry;
    address private owner;

    constructor(address _owner, address _cafeRegistry) {
        owner = _owner;
        cafeRegistry = CafeRegistry(_cafeRegistry);
    }

    function executeOrder(
        address _cafeContract,
        string[] calldata _itemsToOrder,
        uint256[] calldata _amounts
    ) public payable returns (bool) {
        // check that cafe contract exits
        if (cafeRegistry.cafeContracts(_cafeContract) == false)
            revert CafeCore__CafeContractNotInRegistry();

        // check lengths of arrays
        uint256 _arraysLength = _itemsToOrder.length;
        if (_arraysLength != _amounts.length)
            revert CafeCore__ArraysLengthsNotSame();

        // calculate ethAmountToSend and rewards in cafe tokens to mint
        uint256 ethAmountToSend = 0;
        uint256 cafeTokensToMint = 0;

        for (uint256 i = 0; i < _arraysLength; i++) {
            // TODO: check if the item is in the menu
            ethAmountToSend +=
                cafeRegistry.getMenuItemPrice(_cafeContract, _itemsToOrder[i]) *
                _amounts[i];

            // calculate rewards in cafe tokens to mint
            cafeTokensToMint +=
                cafeRegistry.getMenuItemReward(
                    _cafeContract,
                    _itemsToOrder[i]
                ) *
                _amounts[i];
        }
        // check the one time discount
        (
            uint256 oneTimeDiscountThreshold,
            uint256 oneTimeDiscount
        ) = cafeRegistry.cafeInfo(_cafeContract);

        if (
            ((CafeContract(_cafeContract).balanceOf(msg.sender, 1)) *
                oneTimeDiscountThreshold) <
            CafeContract(_cafeContract).balanceOf(msg.sender, 0)
        ) {
            if (ethAmountToSend < oneTimeDiscount) {
                ethAmountToSend = 0;
            } else {
                ethAmountToSend -= oneTimeDiscount;
            }
            CafeContract(_cafeContract).mintClaimed(msg.sender);
        }
        // check the membership discount and adjust the ethAmountToSend
        if (ethAmountToSend != 0) {
            uint256 userMembershipDiscount = cafeRegistry.getMembershipDiscount(
                _cafeContract,
                CafeContract(_cafeContract).balanceOf(msg.sender, 2)
            );

            ethAmountToSend =
                (ethAmountToSend * (100 - userMembershipDiscount)) /
                100;
        } else {
            ethAmountToSend = ethAmountToSend;
        }
        // check if eth sent >= ethAmountToSend
        if (ethAmountToSend > msg.value) revert CafeCore__WrongAmountOfEth();
        // send eth to cafe owner
        (bool success, ) = (
            payable(cafeRegistry.cafePaymentReceivers(_cafeContract))
        ).call{value: ethAmountToSend}("");
        require(success);
        // call mint function TODO: check that everyting went well during minting
        CafeContract(_cafeContract).mint(msg.sender, cafeTokensToMint);
        return true;
    }
}
