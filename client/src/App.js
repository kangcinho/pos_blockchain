import React, { Component } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

class App extends Component {
  state = { loaded: false, namaBarang:"", priceInWei: 0, priceBuy:0,  items:[] };

  componentDidMount = async () => {
    try {
      this.web3 = await getWeb3();

      this.accounts = await this.web3.eth.getAccounts();

      this.networkId = await this.web3.eth.net.getId();
      
      this.instanceItemManager = new this.web3.eth.Contract(
        ItemManagerContract.abi,
        ItemManagerContract.networks[this.networkId] && ItemManagerContract.networks[this.networkId].address,
      );

      this.instanceItem = new this.web3.eth.Contract(
        ItemContract.abi,
        ItemContract.networks[this.networkId] && ItemContract.networks[this.networkId].address,
      );

      this.setState({ loaded: true });
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  onChangeHandler = (event) => {
    this.setState({
      [event.target.name] : event.target.value
    })
  }

  saveItem = async() => {
    const {namaBarang, priceInWei} = this.state;
    let result = await this.instanceItemManager.methods.createItem(namaBarang, priceInWei).send({ from: this.accounts[0] });
    console.log(result);
    let status = result.events.SupplyChainStep.returnValues._step === "0" ? "Created" : result.events.SupplyChainStep.returnValues._step === "1" ? "Paid" : "Delivered";
    let item = { "address": result.events.SupplyChainStep.returnValues._address,  "name": namaBarang, "price":priceInWei, "index": result.events.SupplyChainStep.returnValues._itemIndex, "status": status , "priceBuy": 0};
    this.setState({
      items: [...this.state.items, item]
    })
  }

  buyItem = async(item) => {
    let result = await this.instanceItemManager.methods.triggerPayment(item.index).send({ from: this.accounts[0], value: item.priceBuy });
    let status = result.events.SupplyChainStep.returnValues._step === "0" ? "Created" : result.events.SupplyChainStep.returnValues._step === "1" ? "Paid" : "Delivered";
    console.log(result);
    const temp = this.state.items.map( (it) => {
      if(it.address === item.address){
        it.status = status;
      }
      return it;
    })
    console.log(temp);
    this.setState({
      items:  temp
    })
  }

  deliverItem = async(item) => {
    let result = await this.instanceItemManager.methods.triggerDeliverd(item.index).send({ from: this.accounts[0]});
    let status = result.events.SupplyChainStep.returnValues._step === "0" ? "Created" : result.events.SupplyChainStep.returnValues._step === "1" ? "Paid" : "Delivered";
    console.log(result);
    const temp = this.state.items.map( (it) => {
      if(it.address === item.address){
        it.status = status;
      }
      return it;
    })
    console.log(temp);
    this.setState({
      items:  temp
    })
  }

  editItem = (item) => {
    const temp = this.state.items.map( (it) => {
      if(it.address === item.address){
        it.name = item.name;
        it.price = item.price;
        it.index = item.index;
        it.status = item.status;
        it.priceBuy = item.priceBuy;
      }
      return it;
    })
    this.setState({
      items: temp
    })
  }
  
  editPriceBuy = (event, address) => {
    const temp = this.state.items.map( (it) => {
      if(it.address === address){
        it.priceBuy = event.target.value;
      }
      return it;
    })
    this.setState({
      items:  temp
    })
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    let itemTable = this.state.items.map( (item) => {                    
          return (
            <div key={item.address}>
              <p><b>Index: </b> { item.index }</p>
              <p><b>Address: </b> { item.address }</p>
              <p><b>Nama: </b> { item.name }</p>
              <p><b>Price: </b> { item.price }</p>
              <p><b>Status: </b> { item.status }</p>
              Price Buy in Wei: <input type="text" name="priceBuy"  value={item.priceBuy} onChange={ (e) => this.editPriceBuy(e, item.address)} />
              <button onClick={() =>  this.buyItem(item) }>Beli</button>
              <button onClick={() =>  this.deliverItem(item) }>Request Pengiriman</button>
              <hr/>
            </div>        
          )          
    }) 
    return (
      <div className="App">
        <h1>Blockchain POS System</h1>        
        <hr/>
        <h2>Add Items</h2>
        <div>
          <label>Nama Item</label> <br/>
          <input type="text" name="namaBarang" value={this.state.namaBarang} onChange={this.onChangeHandler} />
        </div>
        <div>
          <label>Harga Dalam Wei</label><br/>
          <input type="text" name="priceInWei" value={this.state.priceInWei} onChange={this.onChangeHandler} />
        </div>
        <button onClick={this.saveItem}>Add Item</button>
        <hr/>
        <h2>Items</h2>
        {itemTable}
      </div>
    );
  }
}

export default App;
