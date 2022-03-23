
pragma solidity ^0.6.0;

import "./Ownable.sol";
import "./Item.sol";

contract ItemManager is Ownable{

    enum StateSupplyChain{ Created, Paid, Delivered}

    struct Transaksi_Item{
        Item item;
        ItemManager.StateSupplyChain _state;
    }

    event SupplyChainStep(uint _itemIndex, uint _step, address _address);

    mapping(uint => Transaksi_Item) public items;
    uint itemIndex;

    function createItem(string memory _itemName, uint _itemPrice) public onlyOwner{
        Item item = new Item(this, _itemName, _itemPrice, itemIndex);
        items[itemIndex] =  Transaksi_Item(item, StateSupplyChain.Created);

        emit SupplyChainStep(itemIndex, uint(items[itemIndex]._state), address(item));
        itemIndex++;
    }

    function triggerPayment(uint _itemIndex) public payable{
        require(items[_itemIndex].item.getPrice() == msg.value, "Harga yang dibayar harus sesuai dengan Harga Barang");
        require(items[_itemIndex]._state == StateSupplyChain.Created, "Barang tidak tersedia");
        require(items[_itemIndex].item.getPricePaid() != items[_itemIndex].item.getPrice(), "Barang tidak tersedia");

        items[_itemIndex]._state = StateSupplyChain.Paid;
        items[_itemIndex].item.setPricePaid(msg.value);

        emit SupplyChainStep(_itemIndex, uint(StateSupplyChain.Paid), address(items[_itemIndex].item));      
    }

    function triggerDeliverd(uint _itemIndex) public onlyOwner{
        require(items[_itemIndex]._state == StateSupplyChain.Paid, "Barang belum dibayar");
        items[_itemIndex]._state = StateSupplyChain.Delivered;
        emit SupplyChainStep(_itemIndex, uint(StateSupplyChain.Delivered), address(items[_itemIndex].item));
    }

} 