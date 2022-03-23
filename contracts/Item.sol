pragma solidity ^0.6.0;

import "./ItemManager.sol";

contract Item{
    string private name;
    uint private priceInWei;
    uint private pricePaid;
    uint private index;

    ItemManager itemManager;

    constructor(ItemManager _itemManager, string memory _name, uint _priceInWei, uint _index) public{
        name = _name;
        priceInWei = _priceInWei;
        pricePaid = 0;
        index = _index;
        itemManager = _itemManager;
    }

    receive() external payable{
        (bool success, ) = address(itemManager).call.value(msg.value)(abi.encodeWithSignature("triggerPayment(uint256)", index));
        require(success, "Transaksi Pembelian Item Gagal");
    }

    fallback() external{}


    function getPrice() public view returns(uint){
        return priceInWei;
    }
    
    function setPricePaid(uint _priceItem) public{
        pricePaid = _priceItem;
    }

    function getPricePaid() public view returns(uint){
        return pricePaid;
    }
}