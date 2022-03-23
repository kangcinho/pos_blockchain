pragma solidity ^0.6.0;

contract Ownable{
    address payable private owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(isOwner(), "Only Owner Can");
        _;
    }

    function isOwner() public view returns(bool){
        return (owner == msg.sender);
    }
}