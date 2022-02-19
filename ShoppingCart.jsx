/* eslint-disable no-lone-blocks */
/* eslint-disable prettier/prettier */
import { CloseSquareOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import {
  Drawer,
  Form,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Card,
  Image,
  notification,
  Typography,
  Divider,
  message,
  Spin,
  Skeleton,
  Tooltip,
} from "antd";
import { useGasPrice } from "eth-hooks";
import { createContext, useState } from "react";
import Web3 from "web3";
import { Account, GasGauge } from "..";
import { Collection, Sale, NFTDisplayTrade } from "./Cards";
import ERC20ABI from "../../contracts/external_contracts";
import { useEffect } from "react";
import { ethers, utils } from "ethers";
import { useERC20Balances, useMoralis, useNFTBalances } from "react-moralis";
import axios from "axios";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { useVerifyMetadata } from "../../hooks/useVerifyMetadata";
const { Text } = Typography;
export const CartContext = createContext([]);
export const AddCartContext = createContext(item => {});
export const RemoveCartContext = createContext(item => {});

export const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
];
const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    margin: "0 auto",
    maxWidth: "500px",
    width: "100%",
    gap: "10px",
  },
};

// Form functioning
const { Option } = Select;
const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 10,
  },
};

const validateMessages = {
  required: "${label} is required!",
  types: {
    number: "${label} is not a valid number!",
  },
  number: {
    range: "${label} must be between ${min} and ${max}",
  },
};

function ShoppingCart({
  address,
  userSigner,
  localProvider,
  mainnetProvider,
  price,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
  yourLocalBalance,
  targetNetwork,
  tx,
  writeContracts,
  gun,
}) {
  const { data: assets } = useERC20Balances();
  const [visible, setVisible] = useState(false);
  const [visible1, setVisibility1] = useState(false);
  const [visible2, setVisibility2] = useState(false);
  const [items, setItems] = useState([]);
  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "average");
  const { data: NFTBalances } = useNFTBalances();
  const [toTradeItems, setToTradeItems] = useState([]);
  const [isMobile, setIsMobile] = useState("300px");
  const mql = window.matchMedia("(max-width: 600px)");
  const [theList, setList] = useState();

  // run this multiple times by putting in its own function
  async function getTokenInfo(tokenContract) {
    const [decimals, name, symbol] = await Promise.all([
      tokenContract.methods.symbol().call(),
      tokenContract.methods.decimals().call(),
      tokenContract.methods.name().call(),
    ]);
    return { decimals, name, symbol };
  }

  const sortTheData = dataStruct => {
    let theItems = {
      amount: 0,
      total: 0,
      toMarket: [],
      toBid: [],
      toBlindBid: [],
      toOffer: [],
      toBlindOffer: [],
      toTrade: [],
      toBlindTrade: [],
      toList: [],
    };

    delete dataStruct["amount"];
    // We have an object of arrays, go through each array
    for (let k in dataStruct) {
      dataStruct[k].forEach(thisItem => {
        if (k === "toMarket") {
          if (theItems["toMarket"].length === 0) {
            theItems.total += parseFloat(thisItem.price);
            theItems["toMarket"].push(thisItem);
          } else {
            let seed = Object.values(theItems["toMarket"]).map(i => {
              if (i.stringSeed === thisItem.stringSeed) {
                return true;
              }
            });
            if (!seed.includes(true)) {
              theItems.total += parseFloat(thisItem.price);
              theItems.amount += 1;
              theItems["toMarket"].push(thisItem);
            }
          }
        }
        if (k === "toBid") {
          if (theItems["toBid"].length === 0) {
            theItems.amount += 1;
            theItems["toBid"].push(thisItem);
          } else {
            let seed = Object.values(theItems["toBid"]).map(i => {
              if (i.stringSeed === thisItem.stringSeed) {
                return true;
              } else {
                return false;
              }
            });
            console.log(seed);
            if (!seed.includes(true)) {
              theItems.amount += 1;
              theItems["toBid"].push(thisItem);
            }
          }
        }
        if (k === "toBlindBid") {
          if (theItems["toBlindBid"].length === 0) {
            theItems.amount += 1;
            theItems["toBlindBid"].push(thisItem);
          } else {
            let seed = Object.values(theItems["toBlindBid"]).map(i => {
              if (i.stringSeed === thisItem.stringSeed) {
                return true;
              } else {
                return false;
              }
            });
            console.log(seed);
            if (!seed.includes(true)) {
              theItems.amount += 1;
              theItems["toBlindBid"].push(thisItem);
            }
          }
        }
        if (k === "toOffer") {
          if (theItems["toOffer"].length === 0) {
            theItems.amount += 1;
            theItems["toOffer"].push(thisItem);
          } else {
            let seed = Object.values(theItems["toOffer"]).map(i => {
              if (i.stringSeed === thisItem.stringSeed) {
                return true;
              } else {
                return false;
              }
            });
            if (!seed.includes(true)) {
              theItems.amount += 1;
              theItems["toOffer"].push(thisItem);
            }
          }
        }
        if (k === "toBlindOffer") {
          if (theItems["toBlindOffer"].length === 0) {
            theItems.amount += 1;
            theItems["toBlindOffer"].push(thisItem);
          } else {
            let seed = Object.values(theItems["toBlindOffer"]).map(i => {
              if (i.stringSeed === thisItem.stringSeed) {
                return true;
              } else {
                return false;
              }
            });
            if (!seed.includes(true)) {
              theItems.amount += 1;
              theItems["toBlindOffer"].push(thisItem);
            }
          }
        }
        if (k === "toTrade") {
          if (theItems["toTrade"].length === 0) {
            theItems.amount += 1;
            theItems["toTrade"].push(thisItem);
          } else {
            let seed = Object.values(theItems["toTrade"]).map(i => {
              if (i.stringSeed === thisItem.stringSeed) {
                return true;
              } else {
                return false;
              }
            });
            if (!seed.includes(true)) {
              theItems.amount += 1;
              theItems["toTrade"].push(thisItem);
            }
          }
        }
        if (k === "toBlindTrade") {
          if (theItems["toBlindTrade"].length === 0) {
            theItems.amount += 1;
            theItems["toBlindTrade"].push(thisItem);
          } else {
            let seed = Object.values(theItems["toBlindTrade"]).map(i => {
              if (i.stringSeed === thisItem.stringSeed) {
                return true;
              } else {
                return false;
              }
            });
            if (!seed.includes(true)) {
              theItems.amount += 1;
              theItems["toBlindTrade"].push(thisItem);
            }
          }
        }
        if (k === "toList") {
          if (theItems["toList"].length === 0) {
            theItems.amount += 1;
            theItems["toList"].push(thisItem);
          } else {
            let seed = Object.values(theItems["toList"]).map(i => {
              if (i.stringSeed === thisItem.stringSeed) {
                return true;
              } else {
                return false;
              }
            });
            if (!seed.includes(true)) {
              theItems.amount += 1;
              theItems["toList"].push(thisItem);
            }
          }
        }
      });
    }
    setItems(theItems);
    setVisible(true);
  };

  const onOpen = async () => {
    /*  MainNet NFT token data json from Moralis
      {
        "token_address": "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
        "token_id": "56724872721107676136248314860323901711167165472452343153323179251963330030013",
        "block_number_minted": "13789581",
        "owner_of": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "block_number": "13790636",
        "amount": "1",
        "contract_type": "ERC721",
        "name": "",
        "symbol": "",
        "token_uri": null,
        "metadata": null,
        "synced_at": null,
        "is_valid": 0,
        "syncing": 1,
        "frozen": 0,
        "stringSeed": "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea8556724872721107676136248314860323901711167165472452343153323179251963330030013"
    }
  */

    let marketItems = window.localStorage.getItem("marketItems");
    if (marketItems) {
      let mktItems = await JSON.parse(marketItems);
      sortTheData(mktItems);
    }
  };

  //*~~~> To remove items from local storage
  const removeItem = async (item, list) => {
    let marketItems = window.localStorage.getItem("marketItems");
    let mktItems = await JSON.parse(marketItems);
    delete mktItems["amount"];
    if (mktItems) {
      mktItems[list].map((cartItem, i) => {
        if (cartItem.stringSeed === item.stringSeed) {
          if (item[`${list}`]) {
            mktItems[list].splice(i, 1);
          }
        }
      });
      window.localStorage.setItem("marketItems", JSON.stringify(mktItems));
      sortTheData(mktItems);
    }
  };

  /// @notice
  /*~~~> Public function to list NFTs for sale 

  function listMktItem(
    bool[] calldata is1155,
    uint[] calldata amount1155,
    uint[] calldata tokenId,
    uint[] calldata price,
    address[] calldata nftContract
  )
  <~~~*/

  ///@dev
  /*~~~>
    is1155: (true) if item is ERC1155;
    amount1155: amount of ERC1155 to trade;
    tokenId: token Id of the item to list;
    price: eth value wanted to purchase;
    nftContract: contract of item to list on the market;
  <~~~*/
  const list = async () => {
    let howMany = 0;
    let is1155s = [];
    let amount1155s = [];
    let tokenIds = [];
    let prices = [];
    let nftContracts = [];
    items["toList"] &&
      items["toList"].map(async nft => {
        howMany += 1;
        if (nft.contract_type === "ERC721") {
          is1155s.push(false);
        } else {
          is1155s.push(true);
        }
        const options = {
          type: nft?.is1155,
          amount: nft?.amount,
        };
        let string = nft.price.toString();
        let bigPrice = utils.parseEther(string);
        nftContracts.push(options.contractAddress);
        tokenIds.push(options.tokenId);
        prices.push(bigPrice);
        amount1155s.push(options.amount);

        // Create new DB instance
        let newListing = gun
          .get("market")
          .get("listings")
          .get(nft.stringSeed)
          .put({
            item: nft,
            id: nft.tokenId,
            collection: nft.collection,
            likes: {
              amount: 0,
            },
            favorites: {
              amount: 0,
            },
            createdAt: Date.now(),
          });
        gun.get("marketCollections").get(nft.contractAddress).get("listings").set(newListing);
      });
    /*~~~> listMktItem( bool[] calldata is1155, uint[] calldata amount1155, uint[] calldata tokenId, uint[] calldata price, address[] calldata nftContract <~~~*/
    const result = await writeContracts.NFTMarket.listMktItem(is1155s, amount1155s, tokenIds, prices, nftContracts);
    result && message.info(result);
    result &&
      notification.open({
        message: "Successfully listed!",
        description: (
          <>
            <Text>{`Listed ${howMany} item(s) on the market, transaction: `}</Text>
            <Text copyable>{result.hash}</Text>
          </>
        ),
      });
  };

  /// @notice
  /*~~~> 
  Public function to sell ERC721 Tokens 

  function sellMktItem(
    address[] calldata nftContract,
    uint256[] calldata itemId
    ) 

  <~~~*/
  ///@dev
  /*~~~>
    nftContract: contract of item to list on the market;
    itemId: itemId for internal storage location;
  <~~~*/
  ///@return Bool

  const swap = async () => {
    //NFTContract and itemID is needed to execute a swap with the NFT Market contract
    let howMany = 0;
    let ids = [];
    let contracts = [];
    items["toMarket"].forEach(item => {
      howMany += 1;
      contracts.push(item.nftCont);
      ids.push(item.itemId);
    });
    let amount = items.total.toString();
    const result = tx(
      writeContracts.NFTMarket.sellMktItem(contracts, ids, { value: utils.parseEther(amount) }),
      update => {
        message.info("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          message.info(" 🍾 Transaction " + update.hash + " finished!");
          message.info(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
        items["toMarket"].forEach(item => {
          removeItem(item, "toMarket");
          let swapItems = gun.get("marketCollections");
          // Update DB listings
          swapItems.get("marketListings").get(item.stringSeed).put(null);
          if (item.hasBid) {
            swapItems.get("marketBids").get(item.stringSeed).put(null);
          }
          if (item.hasTrade) {
            swapItems.get("marketTrades").get(item.stringSeed).put(null);
          }
          if (item.hasOffer) {
            swapItems.get("marketOffers").get(item.stringSeed).put(null);
          }
        });
      },
    );
    message.info("awaiting metamask/web3 confirm result...", result);
    alert(await result);
    notification.open({
      message: "Successfully swapped!",
      description: (
        <>
          <Text>{`Swapped ${howMany} item(s), transaction: `}</Text>
          <Text copyable>{result.hash}</Text>
        </>
      ),
    });
    onOpen();
  };

  ///@notice
  /*~~~>
    Public function to enter a trade of an ERC721 or ERC1155 NFT for any item listed on market
    function enterTrade(
      uint[] memory amount1155,
      uint[] memory itemId,
      uint[] memory tokenId,
      address[] memory nftContract,
      address[] memory seller
  )
  <~~~*/
  ///@dev
  /*~~~>
    is1155: (true) if NFt is ERC1155;
    amount1155: how many ERC1155 to be offered for trade;
    itemId: Market contract internal state itemId;
    tokenId: specific token Id to trade listed item for;
    nftContract: contract address of the NFT to trade;
    seller: ownerOf NFT desired;
  <~~~*/
  const trade = async () => {
    let howMany = 0;
    let amount1155s = [];
    let itemIds = [];
    let tokenIds = [];
    let nftContracts = [];
    let sellers = [];

    toTradeItems &&
      toTradeItems.forEach(async nft => {
        const options = {
          type: nft.type === "ERC721" ? false : true,
          amount: nft.type === "ERC1155" ? nft.amount : 0,
        };
        howMany += 1;
        nftContracts.push(nft.trade_token_address);
        tokenIds.push(nft.trade_token_id);
        amount1155s.push(nft.amount);
        itemIds.push(nft.itemId);
        sellers.push(nft.seller);

        let gunTrade = gun.get("marketCollections");
        let newTrade = gunTrade.get("marketTrades").get(nft.stringSeed).put({
          is1155: options.type,
          itemTokenId: nft.token_id,
          itemContract: nft.token_address,
          stringSeed: nft.stringSeed,
          itemId: nft.itemId,
          seller: nft.seller,
          tradeAmount: options.amount,
          tradeTokenId: nft.tokenId,
          tradeContractAddress: nft.contractAddress,
          createdAt: Date.now(),
        });
        gunTrade.get("marketListings").get(nft.stringSeed).get("trades").set(newTrade);
      });

    const result = tx(
      writeContracts.MarketTrades.enterTrade(amount1155s, itemIds, tokenIds, nftContracts, sellers),
      update => {
        message.info("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          message.info(" 🍾 Transaction " + update.hash + " finished!");
          message.info(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
    result && message.info("awaiting metamask/web3 confirm result...", result);
    result && message.info(await result);
    result &&
      notification.open({
        message: "Successfully traded!",
        description: (
          <>
            <Text>{`Traded ${howMany} item(s), transaction: `}</Text>
            <Text copyable>{result.hash}</Text>
          </>
        ),
      });
  };

  ///@notice
  //*~~~> Public function to enter blind trades
  ///@dev
  /*~~~>
     is1155: (true) if ERC1155;
    isSpecific: (true) if item to trade for is specific;
    wantedId: token Id of the NFT desired;
    tokenId: token Id of the NFT to trade for wanted NFT;
    amount1155: how many 1155;
    nftContract: token address of the NFT entered to trade;
    wantCont: wanted contract address;
  <~~~*/
  ///@return Bool
  const blindTrade = async () => {
    let howMany = 0;
    let is1155 = [];
    let isSpecific = [];
    let wantedIds = [];
    let tokenIds = [];
    let amount = [];
    let contracts = [];
    let wantedContract = [];

    toTradeItems &&
      toTradeItems.forEach(async nft => {
        howMany += 1;
        amount.push(nft.amount);
        isSpecific.push(nft.isSpecific);
        wantedIds.push(nft.wantedIds);
        contracts.push(nft.contractAddress);
        wantedContract.push(nft.wantedContract);
        tokenIds.push(nft.tokenId);
        if (nft.type === "ERC1155" || nft.amount > 0) {
          is1155.push(true);
        } else {
          is1155.push(false);
        }
        let gunTrade = gun.get("marketCollections");
        let newTrade = gunTrade
          .get("marketBlindTrades")
          .get(nft.contractAddress)
          .put({
            is1155: nft.type,
            tradeAmount: nft.type === true ? nft.amount : 0,
            contractAddress: nft.contractAddress,
            collectionName: nft.collectionName,
            isSpecific: nft.isSpecific,
            wantedId: nft.wantedIds,
            tokenId: nft.tokenId,
            createdAt: Date.now(),
          });
        gunTrade.get("nfts").get(nft.collectionName).get("blindTrades").set(newTrade);
      });

    const result = tx(
      writeContracts.MarketTrades.enterBlindTrade(
        is1155,
        isSpecific,
        wantedIds,
        tokenIds,
        amount,
        contracts,
        wantedContract,
      ),
      update => {
        message.info("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          message.info(" 🍾 Transaction " + update.hash + " finished!");
          message.info(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
    result && message.info("awaiting metamask/web3 confirm result...", result);
    result && message.info(await result);
    result &&
      notification.open({
        message: "Successfully traded!",
        description: (
          <>
            <Text>{`Traded ${howMany} item(s), transaction: `}</Text>
            <Text copyable>{result.hash}</Text>
          </>
        ),
      });
  };

  /// @notice
  /*~~~>
  Bid for NFTs
   Code relied abstracted from CryptoPhunksMarket contract: 0x3b484b82567a09e2588A13D54D032153f0c0aEe0
    Thank you Phunks, your inspiration and phriendship meant the world to me and helped me through hard times,
      never stop phighting, never surrender, always stand up for what is right and make the best of all situations towards all people
        "When the power of love overcomes the love of power the world will know peace." - Jimi Hendrix <3
   <~~~*/
  /// @dev
  /*~~~>
      tokenId: token_id of the NFT to be bid on;
      itemId: itemId for internal storage in the Market Contract;
      bidValue: Value of the bid entered;
      seller: ownerOf NFT;
    <~~~*/
  const bid = async () => {
    let howMany = 0;
    let total = 0;
    let tokenIds = [];
    let itemIds = [];
    let bidValues = [];
    let sellers = [];
    items["toBid"] &&
      items["toBid"].forEach(async nft => {
        howMany += 1;
        tokenIds.push(nft.tokenId);
        itemIds.push(nft.itemId);
        bidValues.push(nft.bidValue);
        sellers.push(nft.seller);
        total = parseInt(nft.bidValue) + total;
        let bids = gun.get("marketCollections");
        let newBid = bids.get("marketBids").put({
          hasBid: true,
          bidder: address,
          bidCreatedAt: Date.now(),
        });
        bids.get("marketListings").get(nft.stringSeed).get("bids").set(newBid);
      });
    let totalAmount = total.toString();
    console.log("total amount is: ", totalAmount);
    const result = tx(
      writeContracts.MarketBids.enterBidForNft(tokenIds, itemIds, bidValues, sellers, {
        value: utils.parseEther(totalAmount),
      }),
      update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          // message.info(" 🍾 Transaction " + update.hash + " finished!");
          message.info(
            " 🍾 Transaction " +
              update.hash +
              " finished!" +
              " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
    message.info("awaiting metamask/web3 confirm result...", result);
    message.info(await result);
    notification.open({
      message: "Successfully bid!",
      description: (
        <>
          <Text>{`Placed ${howMany} bid(s), transaction: `}</Text>
          <Text copyable>{result.hash}</Text>
        </>
      ),
    });
    onOpen();
  };

  /// @notice
  //*~~~> Public function for entering specific or collection wide blind bids
  /// @dev
  /*~~~>
        isSpecific: Is bid for a specific NFT(true) or collection-wide bid(false?;
        value: Bid value;
        collectionBid: Address of collection to be bid on;
        tokenId: token_id being bid on;
        amount: Amount to be bid on if the specific item is an ERC1155;
      <~~~*/
  /// @return Bool
  const blindBid = async () => {
    let howMany = 0;
    let total = 0;
    let isSpecific = [];
    let bidValues = [];
    let collectionBid = [];
    let tokenId = [];
    let amount = [];
    items["toBid"] &&
      items["toBid"].forEach(async nft => {
        const options = {
          tokenId: nft.tokenId ? nft.tokenId : 0,
          amount: nft.amount1155 ? nft.amount1155 : 0,
        };
        howMany += 1;
        isSpecific.push(nft.isSpecific);
        tokenId.push(options.tokenId);
        bidValues.push(nft.bidValue);
        collectionBid.push(nft.contractAddress);
        amount.push(nft.amount1155);
        total = parseInt(nft.bidValue) + total;
        let bids = gun.get("marketCollections");
        let newBid = bids.get("marketBlindBids").put({
          isSpecific: nft.isSpecific,
          tokenId: nft.tokenId,
          value: nft.bidValue,
          bidder: address,
          collectionAddress: nft.contractAddress,
          collection: nft.collectionName,
          bidCreatedAt: Date.now(),
        });
        bids.get("nfts").get(nft.collectionName).get("blindBids").set(newBid);
      });
    let totalAmount = total.toString();
    console.log("total amount is: ", totalAmount);
    const result = tx(
      writeContracts.MarketBids.enterBlindBid(isSpecific, bidValues, tokenId, amount, collectionBid, {
        value: utils.parseEther(totalAmount),
      }),
      update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          message.info(
            " 🍾 Transaction " +
              update.hash +
              " finished!" +
              " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
    message.info("awaiting metamask/web3 confirm result...", result);
    message.info(await result);
    notification.open({
      message: "Successfully bid!",
      description: (
        <>
          <Text>{`Placed ${howMany} bid(s), transaction: `}</Text>
          <Text copyable>{result.hash}</Text>
        </>
      ),
    });
    onOpen();
  };

  ///@notice
  /*~~~>
    Public function to offer ERC20 tokens to swap with any ERC721 or ERC1155
  <~~~*/
  ///@dev
  /*~~~>
    itemId: market item Id;
    amount: ERC20 amount;
    tokenCont: Contract of token to be offered;
    seller: ownerOf the NFT item listed for sale
  <~~~*/
  ///@return Bool
  const offer = async () => {
    let howMany = 0;
    let itemIds = [];
    let amounts = [];
    let tokenContracts = [];
    let sellers = [];
    items["toOffer"] &&
      items["toOffer"].forEach(async nft => {
        howMany += 1;

        const options = {
          type: nft?.is1155,
          tokenId: nft?.tokenId,
          seller: nft?.seller,
          amount: nft?.amount,
          itemId: nft?.itemId,
        };
        // grab ERC20 Token Name

        const tokenContract = new Web3.eth.Contract(ERC20ABI, nft.offerContract);
        const { decimals, name, symbol } = getTokenInfo(tokenContract);

        tokenContracts.push(options.contractAddress);
        sellers.push(options.seller);
        let amount = new Web3.BigNumber(options.amount * decimals).toNumber();
        amounts.push(amount);
        itemIds.push(options.itemId);

        // Create new gun DB instance
        let newOffer = gun.get("marketCollections").get("marketOffers").get(nft.stringSeed).put({
          offerContract: nft.offerContract,
          offerName: name,
          offerSymbol: symbol,
          offerAmount: nft.amount,
          offerer: address,
          offerCreatedAt: Date.now(),
        });
        gun.get("marketCollections").get("marketListings").get(nft.stringSeed).get("offers").set(newOffer);
      });
    const result = tx(
      writeContracts.MarketOffers.enterOfferForNft(itemIds, amounts, tokenContracts, sellers),
      update => {
        message.info("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          message.info(
            " 🍾 Transaction " +
              update.hash +
              " finished!" +
              " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
    message.info("awaiting metamask/web3 confirm result...", result);
    alert(await result);
    notification.open({
      message: "Successfully offered tokens!",
      description: (
        <>
          <Text>{`Token offered on ${howMany} item(s), transaction: `}</Text>
          <Text copyable>{result.hash}</Text>
        </>
      ),
    });
  };

  ///@notice
  /*~~~> 
    Public function to enter blind offer for specific or collection-wide NFT(s)
  <~~~*/
  ///@dev
  /*~~~>
    isSpecific: (true) if the offer is for a specific NFT, else false;
    amount1155: how many 1155 desired?
    tokenId: Id of specific NFT offered in exchange for ERC20;
    amount: amount of ERC20 tokens to offer;
    tokenCont: token contract address of the offer;
    collection: Collection address of the desired NFT(s)
  <~~~*/
  const blindOffer = async () => {
    let howMany = 0;
    let isSpecifics = [];
    let amount1155s = [];
    let tokenIds = [];
    let amounts = [];
    let tokenContracts = [];
    let collectionAddress = [];
    items["toOffer"] &&
      items["toOffer"].forEach(async nft => {
        howMany += 1;
        const options = {
          amount1155: nft.amount1155 ? nft.amount1155 : 0,
          tokenId: nft.tokenId ? nft.tokenId : 0,
        };

        // grab ERC20 Token Name
        const tokenContract = new Web3.eth.Contract(ERC20ABI, nft.offerContract);
        const { decimals, name, symbol } = getTokenInfo(tokenContract);
        isSpecifics.push(nft.isSpecific);
        amount1155s.push(options.amount1155);
        tokenIds.push(options.tokenId);
        let amount = new Web3.BigNumber(nft.amount * decimals).toNumber();
        amounts.push(amount);
        nft.push(nft.itemId);
        tokenContracts.push(nft.offerContract);
        collectionAddress.push(nft.contractAddress);

        // Create new gun DB instance
        let newOffer = gun.get("marketCollections").get("marketBlindOffers").get(nft.contractAddress).put({
          offerContract: nft.offerContract,
          offerName: name,
          offerSymbol: symbol,
          offerAmount: nft.amount,
          offerer: address,
          offerCreatedAt: Date.now(),
        });
        gun.get("marketCollections").get("marketListings").get(nft.stringSeed).get("offers").set(newOffer);
      });
    const result = tx(
      writeContracts.MarketOffers.enterBlindOffer(
        isSpecifics,
        amount1155s,
        tokenIds,
        amounts,
        tokenContracts,
        collectionAddress,
      ),
      update => {
        message.info("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          message.info(
            " 🍾 Transaction " +
              update.hash +
              " finished!" +
              " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      },
    );
    message.info("awaiting metamask/web3 confirm result...", result);
    alert(await result);
    notification.open({
      message: "Successfully offered tokens!",
      description: (
        <>
          <Text>{`Token offered on ${howMany} item(s), transaction: `}</Text>
          <Text copyable>{result.hash}</Text>
        </>
      ),
    });
  };

  const makeCall = async (callName, contract, args, metadata = {}) => {
    if (contract[callName]) {
      let result;
      if (args) {
        result = await contract[callName](...args, metadata);
      } else {
        result = await contract[callName]();
      }
      return result;
    }
    console.log("no call of that name!");
    return undefined;
  };

  const [offers, setOffers] = useState();

  const updateRouterAllowance = async (newAllowance, tokenContract) => {
    try {
      const tempContract = new ethers.Contract(tokenContract, erc20Abi, userSigner);
      const result = await makeCall("approve", tempContract, [writeContracts.MarketOffers.address, newAllowance]);
      notification.open(result);
      return true;
    } catch (e) {
      notification.open({
        message: "Approval unsuccessful",
        description: `Error: ${e.message}`,
      });
    }
  };

  const approveRouter = async (item, amnt, tokenContract) => {
    let decimals;
    let name;
    theList.forEach(token => {
      if (token.address === tokenContract) {
        decimals = token.decimals;
        name = token.name;
      }
    });
    const approvalAmount = ethers.utils.hexlify(ethers.utils.parseUnits(amnt.toString(), decimals));
    message.info(approvalAmount);
    const approval = updateRouterAllowance(approvalAmount, tokenContract);
    if (approval) {
      item.offerApproved = true;
      notification.open({
        message: "Token transfer approved",
        description: `You can now swap up to ${amnt} ${name}`,
      });
    }
  };

  /*~~~> 
  Function to Redeem New NFT for PHUNKY
  function redeemForNft(uint id, uint amount, address to, string memory uri)
  <~~~*/
  // async function prepareMarketData() {
  //     let collectionNames = [];
  //     let contractAddresses = [];
  //     let urls = [];
  //     let addresses = [];

  //     items["toCollections"] && items["toCollections"].map(async(collection)=>{

  //       const { collectionName, contractAddress, website, category, description, fileUrl } = collection;
  //       if (!collectionName || !contractAddress || !category || !description || !fileUrl) alert("Collections details are missing!");
  //       //*~~~> first, upload to IPFS
  //       const data = JSON.stringify({
  //         collectionName,
  //         contractAddress,
  //         website,
  //         category,
  //         description,
  //         image: fileUrl,
  //       });
  //       let added = await ipfs.add(data);
  //       // console.log("Added:", added);
  //       let url = `https://ipfs.infura.io/ipfs/${added.path}`;
  //       urls.push(url);
  //       collectionNames.push(collectionName);
  //       contractAddresses.push(contractAddress);
  //       addresses.push(address)
  //       // Splice out the collection
  //       let index = collection.indexOf(collection.tempImage)
  //       collection.splice(index, 1);
  //       // Create new GUN DB instance
  //       gun
  //       .get("marketCollections")
  //       .get(collectionName)
  //       .put({
  //           marketListings: [],
  //           category: collection.category,
  //           collection: collection,
  //           likes: {
  //             amount:0,
  //             likers:[]
  //           },
  //           favorites: {
  //             amount:0,
  //             favoriteers: []
  //           },
  //           createdAt: Date.now()
  //       })
  //     })
  //     // try {
  //       /*~~~> Finally, write to the MarketCollections contract to execute a mass order for all collections in the arrays. <~~~*/
  //       writeContracts.MarketCollections.createMarketCollection(collectionNames, urls, contractAddresses, addresses);
  //   //     }  catch (error) {
  //   //   console.log("Error uploading file: ", error);
  //   // }
  //   window.localStorage.setItem("toCollections", "")
  // }

  /*~~~> 
  Function for creating new 721 Contract
  function newNftContract(address controller, address minter, string calldata name, string calldata symbol)
  <~~~*/

  /*~~~> 
  Function for creating new 1155 Contract
  function new1155Contract(address controller, address minter, string calldata tokenURI)
  <~~~*/

  //*~~~> For selecting amount of 1155
  const [amountForm, setAmountForm] = useState(false);
  function toggleCheck1155() {
    if (amountForm) {
      setAmountForm(false);
    } else {
      setAmountForm(true);
    }
  }

  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    let mobileView = mql.matches;
    if (mobileView) {
      setIsMobile("300px");
    }
  }, []);

  const handleTradeClick = nft => {
    // setItemToTrade(nft);
    setVisibility1(true);
  };

  useEffect(() => {
    const loadList = async () => {
      // https://tokens.coingecko.com/uniswap/all.json
      const res = await axios.get("https://tokens.coingecko.com/uniswap/all.json");
      const { tokens } = res.data;
      console.log(tokens);
      setList(tokens);
    };
    loadList();
  }, []);
  let total = items.total;
  const { currentTheme } = useThemeSwitcher();

  const [listReady, setListReady] = useState(false);
  const [swapReady, setSwapReady] = useState(false);
  const [offerReady, setOfferReady] = useState(false);
  const [bidReady, setBidReady] = useState(false);
  const [tradeReady, setTradeReady] = useState(false);
  const [blindBidReady, setBlindBidReady] = useState(false);
  const [blindTradeReady, setBlindTradeReady] = useState(false);
  const [blindOfferReady, setBlindOfferReady] = useState(false);

  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);
  const { verifyMetadata } = useVerifyMetadata();

  const setItemToStorage = (nft, item) => {
    item.trade_token_id = nft.token_id;
    item.trade_token_address = nft.token_address;
    item.itemConfirmed = true;
    setVisibility1(false);
    setToTradeItems([...toTradeItems, item]);
  };

  const handleAmountChange = (e, item) => {
    item.amount = e.target.value;
  };

  return (
    <>
      <Space>
        <Button
          color={currentTheme === "light" ? "#1890ff" : "#2caad9"}
          key="shopping-cart-top-space-button"
          type="primary"
          onClick={onOpen}
          icon={<ShoppingCartOutlined />}
        >
          Shopping Cart
        </Button>
      </Space>
      <Drawer
        title="Cart items"
        key="shopping-cart-top-space-drawer"
        width={isMobile}
        onClose={onClose}
        visible={visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={false}
      >
        <div>
          <GasGauge key="shopping-cart-top-space-gas" gasPrice={gasPrice} />
        </div>
        <div>
          <b key="shopping-cart-top-space-holdings" style={{ marginLeft: "5px" }}>
            ETH: {utils.formatEther(yourLocalBalance || 0)}
          </b>
        </div>
        <Divider />

        {items && items["toMarket"]?.length > 0 ? (
          <div
            key="shopping-cart-sales"
            style={{
              margintop: "20px",
              marginBottom: "20px",
              width: "100%",
              gap: "10px",
            }}
          >
            <h1>Sales</h1>
            {items["toMarket"].map(item => {
              return (
                <div>
                  <CloseSquareOutlined
                    key={"shopping-cart-sales-close-square" + item.tokenId}
                    onClick={() => removeItem(item, "toMarket")}
                    style={{ margin: "5px", alignItems: "flex-end" }}
                  />
                  <Sale key={"shopping-cart-sales-item" + item.tokenId} item={item} />
                  <Form>
                    {item.contract_type === "ERC1155" && (
                      <Form.Item
                        key={"shopping-cart-sales-form-item-amount1155" + item.tokenId}
                        name={["collection", "amount"]}
                        label="Amount"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: "Please enter how many NFTs..",
                          },
                        ]}
                      >
                        <Input
                          key={"shopping-cart-sales-form-input-amount" + item.tokenId}
                          onChange={e => {
                            item.amount1155 = e.target.value;
                          }}
                        />
                      </Form.Item>
                    )}
                  </Form>
                </div>
              );
            })}

            {total > 0 ? (
              <div style={{ margin: "10px" }} key="shopping-cart-sales-total">
                Swap Total: {total} ETH
              </div>
            ) : (
              <></>
            )}

            {address && address !== undefined ? (
              <>
                {items["toMarket"] && items["toMarket"].length > 0 ? (
                  <Button key="shopping-cart-sales-swap-button" onClick={() => setSwapReady(true)} type="primary">
                    Confirm & Swap!
                  </Button>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <Account
                key="shopping-cart-sales-account"
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            )}
          </div>
        ) : (
          <></>
        )}
        {swapReady && (
          <Modal
            title={"Order confirmation.."}
            visible={swapReady}
            onCancel={() => setSwapReady(false)}
            okButtonProps={{ style: { display: "none" } }}
          >
            <div>
              <h1>Confirm Transaction</h1>
              <p>You are about to Swap the following items for ETH:</p>
              {items["toMarket"].map(marketItem => {
                return (
                  <div style={styles.NFTs}>
                    <Card
                      style={{ width: "200px", border: "2px solid #e7eaf3" }}
                      cover={
                        <Image
                          preview={false}
                          src={marketItem.image || "error"}
                          key={marketItem.tokenId}
                          fallback="data:image/png;base64,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"
                          alt=""
                          style={{ height: "200px", width: "200px" }}
                        />
                      }
                      key={marketItem.nftCont}
                    >
                      <h6>Id: {marketItem.token_id}</h6>
                      {marketItem.contract_type === ["ERC1155"] && <h7>{marketItem.amount1155} ERC1155 NFTs</h7>}
                    </Card>
                  </div>
                );
              })}
              <Button style={{ margin: 5 }} onClick={swap}>
                Swap
              </Button>
            </div>
          </Modal>
        )}

        {items && items["toBid"]?.length > 0 ? (
          <div key="shopping-cart-bids">
            <Divider />
            <h1>Bids</h1>

            {items["toBid"].map(item => (
              <div key={"shopping-cart-bids-div" + item.tokenId}>
                <CloseSquareOutlined
                  key={"shopping-cart-bids-square-close" + item.tokenId}
                  onClick={() => removeItem(item, "toBid")}
                  style={{ margin: "5px", alignItems: "flex-end" }}
                />
                <Sale key={"shopping-cart-bids-item" + item.tokenId} item={item} />
                <Form {...layout} name="nest-messages" validateMessages={validateMessages}>
                  <Form.Item
                    key={"shopping-cart-bids-form-item" + item.tokenId}
                    name={["collection", "bidValue"]}
                    label="BidValue"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Please enter a bid value..",
                      },
                    ]}
                  >
                    <Input
                      key={"shopping-cart-bids-form-input" + item.tokenId}
                      onChange={e => {
                        item.bidValue = e.target.value;
                      }}
                    />
                    {item.contract_type === "ERC1155" && (
                      <Form.Item
                        key={"shopping-cart-bids-form-item-amount1155" + item.tokenId}
                        name={["collection", "amount"]}
                        label="Amount"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: "Please enter how many NFTs..",
                          },
                        ]}
                      >
                        <Input
                          key={"shopping-cart-bids-form-input-amount" + item.tokenId}
                          onChange={e => {
                            item.amount1155 = e.target.value;
                          }}
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                </Form>
              </div>
            ))}

            {address && address !== undefined ? (
              <>
                {items["toBid"] && items["toBid"].length > 0 ? (
                  <Button key="shopping-cart-bids-bid-button" onClick={() => setBidReady(true)} type="primary">
                    Confirm & Bid!
                  </Button>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <Account
                key="shopping-cart-bids-account"
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            )}
          </div>
        ) : (
          <></>
        )}

        {bidReady && (
          <Modal title={"Order confirmation.."} visible={visible2} onCancel={() => setBidReady(false)}>
            <div>
              <h1>Confirm Transaction</h1>
              <p>You are about to Swap the following items for ETH:</p>
              {items["toBid"].map(marketItem => {
                <div style={styles.NFTs}>
                  <Card
                    style={{ width: "200px", border: "2px solid #e7eaf3" }}
                    cover={
                      <Image
                        preview={false}
                        src={marketItem.image || "error"}
                        key={marketItem.tokenId}
                        fallback="data:image/png;base64,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"
                        alt=""
                        style={{ height: "200px", width: "200px" }}
                      />
                    }
                    key={marketItem.nftCont}
                  >
                    <h6>Id: {marketItem.token_id}</h6>
                    <br />
                    <h6>Bid Value: {marketItem.bidValue}</h6>
                    <br />
                    {marketItem.contract_type === ["ERC1155"] && <div>{marketItem.amount1155} ERC1155 NFTs</div>}
                  </Card>
                </div>;
              })}
              <Button style={{ margin: 5 }} onClick={bid}>
                Bid
              </Button>
            </div>
          </Modal>
        )}

        {items && items["toBlindBid"]?.length > 0 ? (
          <div key="shopping-cart-blind-bids">
            <Divider />
            <h1>"Blind" Bids</h1>

            {items["toBlindBid"].map(item => (
              <div key={"shopping-cart-blind-bids-div" + item.contractAddress}>
                <CloseSquareOutlined
                  key={"shopping-cart-blind-bids-square-close" + item.contractAddress}
                  onClick={() => removeItem(item, "toBlindBid")}
                  style={{ margin: "5px", alignItems: "flex-end" }}
                />
                <Collection key={"shopping-cart-blind-bids-item" + item.contractAddress} item={item} />
                <Form {...layout} name="nest-messages" validateMessages={validateMessages}>
                  <Form.Item
                    key={"shopping-cart-blind-bids-form-item" + item.tokenId}
                    name={["collection", "bidValue"]}
                    label="BidValue"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Please enter a bid value..",
                      },
                    ]}
                  >
                    <Input
                      key={"shopping-cart-blind-bids-form-input" + item.tokenId}
                      onChange={e => {
                        item.bidValue = e.target.value;
                      }}
                    />
                    {item.contract_type === "ERC1155" && (
                      <Form.Item
                        key={"shopping-cart-blind-bids-form-item-amount1155" + item.tokenId}
                        name={["collection", "amount"]}
                        label="Amount"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: "Please enter how many NFTs..",
                          },
                        ]}
                      >
                        <Input
                          key={"shopping-cart-blind-bids-form-input-amount" + item.tokenId}
                          onChange={e => {
                            item.amount1155 = e.target.value;
                          }}
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                </Form>
              </div>
            ))}

            {address && address !== undefined ? (
              <>
                {items["toBlindBid"] && items["toBlindBid"].length > 0 ? (
                  <Button
                    key="shopping-cart-blind-bids-bid-button"
                    onClick={() => setBlindBidReady(true)}
                    type="primary"
                  >
                    Confirm & Bid!
                  </Button>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <Account
                key="shopping-cart-blind-bids-account"
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            )}
          </div>
        ) : (
          <></>
        )}

        {blindBidReady && (
          <Modal title={"Order confirmation.."} visible={visible2} onCancel={() => setBlindBidReady(false)}>
            <div>
              <h1>Confirm Transaction</h1>
              <p>You are about to enter a "blind" Bid for the following items for ETH:</p>
              {items["toBlindBid"].map(marketItem => {
                <div style={styles.NFTs}>
                  <Card
                    style={{ width: "200px", border: "2px solid #e7eaf3" }}
                    cover={
                      <Image
                        preview={false}
                        src={marketItem.image || "error"}
                        key={marketItem.tokenId}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                        alt=""
                        style={{ height: "200px", width: "200px" }}
                      />
                    }
                    key={marketItem.nftCont}
                  >
                    <p>Id: {marketItem.token_id}</p>
                    <br />
                    <h6>Bid Value: {marketItem.bidValue}</h6>
                    <br />
                    <h6>{marketItem.amount1155 ? <h7>For {marketItem.amount1155} ERC1155 NFT's.</h7> : <></>}</h6>
                  </Card>
                </div>;
              })}
              <p style={{ fontSize: 9 }}>
                (The term "blind" is used in reference to an unlisted item on this market. If a specific NFT is not
                chosen, any holder of the collection can claim the bid.)
              </p>
              <Button style={{ margin: 5 }} onClick={blindBid}>
                Bid
              </Button>
            </div>
          </Modal>
        )}

        {items && items["toOffer"]?.length > 0 ? (
          <div key="shopping-cart-offers">
            <Divider />
            <h1>Offers</h1>
            {items &&
              items["toOffer"]?.map(item => (
                <div key={"shopping-cart-offers-div" + item.tokenId}>
                  <CloseSquareOutlined
                    key={"shopping-cart-offers-close-square" + item.tokenId}
                    onClick={() => removeItem(item, "toOffer")}
                    style={{ margin: "5px", alignItems: "flex-end" }}
                  />
                  <Sale key={"shopping-cart-offers-item" + item.tokenId} item={item} />
                  <Form
                    key={"shopping-cart-offers-form" + item.tokenId}
                    {...layout}
                    name="nest-messages"
                    validateMessages={validateMessages}
                  >
                    <Form.Item
                      key={"shopping-cart-offers-form-item" + item.tokenId}
                      name={["collection", "offerValue"]}
                      label="Amount"
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: "Please enter an offer value..",
                        },
                      ]}
                    >
                      <Input
                        key={"shopping-cart-offers-form-input" + item.tokenId}
                        onChange={e => {
                          item.offerValue = e.target.value;
                        }}
                      />
                    </Form.Item>
                    <Select
                      key={"shopping-cart-offers-coin-select" + item.tokenId}
                      defaultValue="No Data"
                      style={{ width: 200 }}
                    >
                      {assets &&
                        assets.map(asset => {
                          return (
                            <Option
                              key={asset.token_address}
                              onChange={e => {
                                item.offerContract = asset.token_address;
                                item.offerName = asset.name;
                              }}
                              value="No Data"
                            >
                              {parseFloat(asset.balance / 10 ** asset.decimals).toFixed(2)} : {asset.name}
                            </Option>
                          );
                        })}
                    </Select>
                    {/* <TokenSelect
        showSearch
        // value={selectedToken}
        onChange={ (e) => {
          item.offerContract = e
        }}
        /> */}
                    {item.contract_type === "ERC1155" && (
                      <Form.Item
                        key={"shopping-cart-blind-offers-form-item-amount1155" + item.tokenId}
                        name={["collection", "amount"]}
                        label="Amount"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: "Please enter how many NFTs..",
                          },
                        ]}
                      >
                        <Input
                          key={"shopping-cart-blind-offers-form-input-amount" + item.tokenId}
                          onChange={e => {
                            item.amount1155 = e.target.value;
                          }}
                        />
                      </Form.Item>
                    )}
                  </Form>
                  {address && address !== undefined ? (
                    <>
                      {!item.offerApproved ? (
                        <Button
                          key={"shopping-cart-offers-button-approve" + item.tokenId}
                          style={{ marginTop: "5px" }}
                          onClick={() => approveRouter(item, item.offerValue, item.offerContract)}
                          type="primary"
                        >
                          Allow Token Approval
                        </Button>
                      ) : (
                        <Button
                          key={"shopping-cart-offers-button-offer" + item.tokenId}
                          style={{ marginTop: "5px" }}
                          onClick={() => {
                            setOffers([...offers, item]);
                          }}
                        >
                          Confirm & Enter offer!
                        </Button>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              ))}

            {address && address !== undefined ? (
              <>
                {items["toOffer"] && items["toOffer"].length > 0 ? (
                  <Button
                    key="shopping-cart-offers-offer"
                    style={{ marginTop: "10px" }}
                    onClick={() => setOfferReady(true)}
                    type="primary"
                  >
                    Offer ERC20!
                  </Button>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <Account
                key="shopping-cart-offers-account"
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            )}
          </div>
        ) : (
          <></>
        )}
        {offerReady && (
          <Modal title={"Order confirmation.."} visible={visible2} onCancel={() => setOfferReady(false)}>
            <div>
              <h1>Confirm Transaction</h1>
              <p>You are about to Offer for the following:</p>
              {items["toOffer"].map(marketItem => {
                <div style={styles.NFTs}>
                  <Card
                    style={{ width: "200px", border: "2px solid #e7eaf3" }}
                    cover={
                      <Image
                        preview={false}
                        src={marketItem.image || "error"}
                        key={marketItem.tokenId}
                        fallback="data:image/png;base64,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"
                        alt=""
                        style={{ height: "200px", width: "200px" }}
                      />
                    }
                    key={marketItem.nftCont}
                  >
                    <p>Id: {marketItem.tokenId}</p>
                    <br />
                    <h5>Offer Value: {marketItem.amount}</h5>
                    <br />
                    <p>
                      For {marketItem.amount} of (Contract: {marketItem.offerContract}).
                    </p>
                  </Card>
                </div>;
              })}
              <Button style={{ margin: 5 }} onClick={offer}>
                Offer
              </Button>
            </div>
          </Modal>
        )}

        {items && items["toBlindOffer"]?.length > 0 ? (
          <div key="shopping-cart-blindoffers">
            <Divider />
            <h1>"Blind" Offers</h1>
            {items &&
              items["toBlindOffer"]?.map(item => (
                <div key={"shopping-cart-blindoffers-div" + item.contractAddress}>
                  <CloseSquareOutlined
                    key={"shopping-cart-blindoffers-close-square" + item.contractAddress}
                    onClick={() => removeItem(item, "toBlindOffer")}
                    style={{ margin: "5px", alignItems: "flex-end" }}
                  />
                  <Collection key={"shopping-cart-blindoffers-item" + item.contractAddress} item={item} />
                  <Form
                    key={"shopping-cart-blindoffers-form" + item.contractAddress}
                    {...layout}
                    name="nest-messages"
                    validateMessages={validateMessages}
                  >
                    <Form.Item
                      key={"shopping-cart-blindoffers-form-item" + item.contractAddress}
                      name={["collection", "offerValue"]}
                      label="Amount"
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: "Please enter an offer value..",
                        },
                      ]}
                    >
                      <Input
                        key={"shopping-cart-blindoffers-form-input" + item.contractAddress}
                        onChange={e => {
                          item.offerValue = e.target.value;
                        }}
                      />
                    </Form.Item>

                    <Select
                      key={"shopping-cart-blindoffers-coin-select" + item.contractAddress}
                      defaultValue="No Data"
                      style={{ width: 200 }}
                    >
                      {assets &&
                        assets.map(asset => {
                          console.log(assets);
                          return (
                            <Option
                              key={asset.token_address}
                              onChange={e => {
                                item.offerContract = asset.token_address;
                              }}
                              value="No Data"
                            >
                              {parseFloat(asset.balance / 10 ** asset.decimals).toFixed(2)} : {asset.name}
                            </Option>
                          );
                        })}
                    </Select>
                    {/* <TokenSelect
        showSearch
        // value={selectedToken}
        onChange={ (e) => {
          item.offerContract = e
        }}
        /> */}

                    {item.contract_type === "ERC1155" && (
                      <Form.Item
                        key={"shopping-cart-blind-offers-form-item-amount1155" + item.tokenId}
                        name={["collection", "amount"]}
                        label="Amount"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: "Please enter how many NFTs..",
                          },
                        ]}
                      >
                        <Input
                          key={"shopping-cart-blind-offers-form-input-amount" + item.tokenId}
                          onChange={e => {
                            item.amount1155 = e.target.value;
                          }}
                        />
                      </Form.Item>
                    )}
                  </Form>
                  {address && address !== undefined ? (
                    <>
                      {!item.offerApproved ? (
                        <Button
                          key={"shopping-cart-blindoffers-button-approve" + item.contractAddress}
                          style={{ marginTop: "5px" }}
                          onClick={() => approveRouter(item, item.offerValue, item.offerContract)}
                          type="primary"
                        >
                          Allow Token Approval
                        </Button>
                      ) : (
                        <Button
                          key={"shopping-cart-blindoffers-button-offer" + item.tokenId}
                          style={{ marginTop: "5px" }}
                          onClick={() => {
                            setOffers([...offers, item]);
                          }}
                        >
                          Enter offer!
                        </Button>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              ))}

            {address && address !== undefined ? (
              <>
                {items["toBlindOffer"] && items["toBlindOffer"].length > 0 ? (
                  <Button
                    key="shopping-cart-blindoffers-offer"
                    style={{ marginTop: "10px" }}
                    onClick={() => setBlindOfferReady(true)}
                    type="primary"
                  >
                    Confirm & Offer ERC20!
                  </Button>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <Account
                key="shopping-cart-blindoffers-account"
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            )}
          </div>
        ) : (
          <></>
        )}
        {blindOfferReady && (
          <Modal title={"Order confirmation.."} visible={visible2} onCancel={() => setBlindOfferReady(false)}>
            <div>
              <h1>Confirm Transaction</h1>
              <p>You are about to enter a "blind" Offer for the following items:</p>
              {items["toBlindOffer"].map(marketItem => {
                <div style={styles.NFTs}>
                  <Card
                    style={{ width: "200px", border: "2px solid #e7eaf3" }}
                    cover={
                      <Image
                        preview={false}
                        src={marketItem.image || "error"}
                        key={marketItem.tokenId}
                        fallback="data:image/png;base64,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"
                        alt=""
                        style={{ height: "200px", width: "200px" }}
                      />
                    }
                    key={marketItem.nftCont}
                  >
                    <p>Id: {marketItem.tokenId}</p>
                    <br />
                    <h5>Offer Value: {marketItem.amount}</h5>
                    <br />
                    <p>
                      For {marketItem.amount} of (Contract: {marketItem.offerContract}).
                    </p>
                    {marketItem.contract_type === ["ERC1155"] && <div>{marketItem.amount1155} ERC1155 NFTs</div>}
                  </Card>
                </div>;
              })}
              <p style={{ fontSize: 9 }}>
                (The term "blind" is used in reference to an unlisted item on this market. If a specific NFT is not
                chosen, any holder of the collection can claim the offer.)
              </p>
              <Button style={{ margin: 5 }} onClick={blindOffer}>
                Offer
              </Button>
            </div>
          </Modal>
        )}

        {items && items["toTrade"]?.length > 0 ? (
          <div key="shopping-cart-to-trade">
            <Divider />
            <h1>Trades</h1>

            {items &&
              items["toTrade"]?.map(item => (
                <div key={"shopping-cart-to-trade-div" + item.tokenId}>
                  <CloseSquareOutlined
                    key={"shopping-cart-to-trade-square-close" + item.tokenId}
                    onClick={() => removeItem(item, "toTrade")}
                    style={{ margin: "5px", alignItems: "flex-end" }}
                  />
                  <Sale key={"shopping-cart-to-trade-item" + item.tokenId} item={item} />
                  <Form>
                    {item.contract_type === "ERC1155" && (
                      <Form.Item
                        key={"shopping-cart-trade-form-item-amount1155" + item.tokenId}
                        name={["collection", "amount"]}
                        label="Amount"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: "Please enter how many NFTs..",
                          },
                        ]}
                      >
                        <Input
                          key={"shopping-cart-trade-form-input-amount" + item.tokenId}
                          onChange={e => {
                            item.amount1155 = e.target.value;
                          }}
                        />
                      </Form.Item>
                    )}
                  </Form>
                  {item.itemConfirmed ? (
                    <></>
                  ) : (
                    <Button
                      key={"shopping-cart-to-trade-select-button" + item.tokenId}
                      onClick={() => handleTradeClick(item)}
                      type="primary"
                    >
                      Select item!
                    </Button>
                  )}

                  <Modal
                    title={`Select NFT to Trade`}
                    visible={visible1}
                    onCancel={() => setVisibility1(false)}
                    footer="null"
                    okText="Confirm"
                  >
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <h1>🖼 NFT Holdings</h1>
                      <div style={styles.NFTs}>
                        {!NFTBalances ? <Spin /> : <></>}
                        <Skeleton loading={!NFTBalances?.result}>
                          {NFTBalances?.result &&
                            NFTBalances.result.map((nft, index) => {
                              //Verify Metadata
                              nft = verifyMetadata(nft);

                              return (
                                <div>
                                  <Card
                                    hoverable
                                    actions={[
                                      <Tooltip title="Trade NFT">
                                        <Button onClick={() => setItemToStorage(nft, item)}>Trade!</Button>
                                      </Tooltip>,
                                    ]}
                                    style={{ width: 240, border: "2px solid #e7eaf3" }}
                                    cover={
                                      <Image
                                        preview={false}
                                        src={nft?.image || "error"}
                                        fallback="data:image/png;base64,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"
                                        alt=""
                                        style={{
                                          sizes:
                                            "(max-width: 48rem) 90vw, (max-width: 60rem) 45vw, (max-width: 75rem) 30vw, 25vw",
                                        }}
                                      />
                                    }
                                    key={index}
                                  >
                                    <Meta
                                      title={`Token Id: ${nft.token_id}`}
                                      description={`Token Address: ${nft.token_address}`}
                                    />
                                    {nft && nft.contract_type === "erc1155" && (
                                      <Input placeholder="amount to send" onChange={e => handleAmountChange(e, item)} />
                                    )}
                                  </Card>
                                </div>
                              );
                            })}
                        </Skeleton>
                      </div>
                    </div>
                    <NFTDisplayTrade
                      style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "700px" }}
                      writeContracts={writeContracts}
                      mainnetProvider={mainnetProvider}
                      props={item}
                    />
                  </Modal>
                </div>
              ))}

            {address && address !== undefined ? (
              <>
                {toTradeItems && toTradeItems.length > 0 ? (
                  <Button key="shopping-cart-to-trade-trades" onClick={() => setTradeReady(true)} type="primary">
                    Confirm & List trades!
                  </Button>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <Account
                key="shopping-cart-to-trade-account"
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            )}
          </div>
        ) : (
          <></>
        )}
        {tradeReady && (
          <Modal title={"Order confirmation.."} visible={visible2} onCancel={() => setTradeReady(false)}>
            <div>
              <h1>Confirm Transaction</h1>
              <p>You are about to Trade for the following items:</p>
              {items["toTrade"].map(marketItem => {
                <div style={styles.NFTs}>
                  <Card
                    style={{ width: "200px", border: "2px solid #e7eaf3" }}
                    cover={
                      <Image
                        preview={false}
                        src={marketItem.image || "error"}
                        key={marketItem.tokenId}
                        fallback="data:image/png;base64,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"
                        alt=""
                        style={{ height: "200px", width: "200px" }}
                      />
                    }
                    key={marketItem.nftCont}
                  >
                    <p>Id: {marketItem.token_id}</p>
                    {marketItem.contract_type === ["ERC1155"] && <div>{marketItem.amount1155} ERC1155 NFTs</div>}
                  </Card>
                </div>;
              })}
              <Button style={{ margin: 5 }} onClick={trade}>
                Trade
              </Button>
            </div>
          </Modal>
        )}

        {items && items["toBlindTrade"]?.length > 0 ? (
          <div key="shopping-cart-to-blindtrade">
            <Divider />
            <h1>"Blind" Trades</h1>

            {items &&
              items["toBlindTrade"]?.map(item => (
                <div key={"shopping-cart-to-blindtrade-div" + item.contractAddress}>
                  <CloseSquareOutlined
                    key={"shopping-cart-to-blindtrade-square-close" + item.contractAddress}
                    onClick={() => removeItem(item, "toBlindTrade")}
                    style={{ margin: "5px", alignItems: "flex-end" }}
                  />
                  <Collection key={"shopping-cart-to-blindtrade-item" + item.contractAddress} item={item} />
                  {amountForm && (
                    <Form.Item
                      key={"shopping-cart-blind-trade-form-item-amount1155" + item.tokenId}
                      name={["collection", "amount"]}
                      label="Amount"
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: "Please enter how many NFTs..",
                        },
                      ]}
                    >
                      <Input
                        key={"shopping-cart-blind-trade-form-input-amount" + item.tokenId}
                        onChange={e => {
                          item.amount1155 = e.target.value;
                        }}
                      />
                    </Form.Item>
                  )}
                  <Button
                    key={"shopping-cart-to-blindtrade-select-button" + item.contractAddress}
                    onClick={() => handleTradeClick(item)}
                    type="primary"
                  >
                    Select item!
                  </Button>
                </div>
              ))}

            {address && address !== undefined ? (
              <>
                {toTradeItems && toTradeItems.length > 0 ? (
                  <Button
                    key="shopping-cart-to-blindtrade-trades"
                    onClick={() => setBlindTradeReady(true)}
                    type="primary"
                  >
                    Confirm & List trades!
                  </Button>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <Account
                key="shopping-cart-to-blindtrade-account"
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            )}
          </div>
        ) : (
          <></>
        )}
        {blindTradeReady && (
          <Modal title={"Order confirmation.."} visible={visible2} onCancel={() => setBlindTradeReady(false)}>
            <div>
              <h1>Confirm Transaction</h1>
              <p>You are about to enter a "blind" Trade for the following items:</p>
              {items["toBlindTrade"].map(marketItem => {
                <div style={styles.NFTs}>
                  <Card
                    style={{ width: "200px", border: "2px solid #e7eaf3" }}
                    cover={
                      <Image
                        preview={false}
                        src={marketItem.image || "error"}
                        key={marketItem.tokenId}
                        fallback="data:image/png;base64,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"
                        alt=""
                        style={{ height: "200px", width: "200px" }}
                      />
                    }
                    key={marketItem.nftCont}
                  >
                    <p>Id: {marketItem.token_id}</p>
                    {marketItem.contract_type === ["ERC1155"] && <div>{marketItem.amount1155} ERC1155 NFTs</div>}
                  </Card>
                </div>;
              })}
              <p style={{ fontSize: 9 }}>
                (The term "blind" is used in reference to an unlisted item on this market. If a specific NFT is not
                chosen, any holder of the collection can claim the trade.)
              </p>
              <Button style={{ margin: 5 }} onClick={blindTrade}>
                Trade
              </Button>
            </div>
          </Modal>
        )}

        {items && items["toList"]?.length > 0 ? (
          <div
            style={{
              margintop: "20px",
              marginBottom: "20px",
              width: "100%",
              gap: "10px",
            }}
          >
            <Divider />
            <h1>List on Market!</h1>
            {items["toList"].map(item => (
              <div key={"shopping-cart-to-list-div" + item.tokenId}>
                <CloseSquareOutlined
                  key={"shopping-cart-to-list-close-square" + item.tokenId}
                  onClick={() => removeItem(item, "toList")}
                  style={{ margin: "5px", alignItems: "flex-end" }}
                />
                <Sale key={"shopping-cart-to-list-item" + item.tokenId} item={item} />
                <Form {...layout} name="nest-messages" validateMessages={validateMessages}>
                  <Form.Item
                    key={"shopping-cart-to-list-form-item" + item.tokenId}
                    name={["listing", "price"]}
                    label="price"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Please enter a price..",
                      },
                    ]}
                  >
                    <Input
                      key={"shopping-cart-to-list-form-input" + item.tokenId}
                      onChange={e => {
                        item.price = e.target.value;
                      }}
                    />
                  </Form.Item>
                  {item.contract_type === "ERC1155" && (
                    <Form.Item
                      key={"shopping-cart-list-form-item-amount1155" + item.tokenId}
                      name={["collection", "amount"]}
                      label="Amount"
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: "Please enter how many NFTs..",
                        },
                      ]}
                    >
                      <Input
                        key={"shopping-cart-list-form-input-amount" + item.tokenId}
                        onChange={e => {
                          item.amount1155 = e.target.value;
                        }}
                      />
                    </Form.Item>
                  )}
                </Form>
              </div>
            ))}

            {address && address !== undefined ? (
              <>
                {items.toList && items.toList.length > 0 ? (
                  <Button key={"shopping-cart-to-list-list-button"} onClick={() => setListReady(true)} type="primary">
                    List!
                  </Button>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <Account
                key={"shopping-cart-to-list-account"}
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            )}
          </div>
        ) : (
          <div></div>
        )}
        {listReady && (
          <Modal title={"Order confirmation.."} visible={visible2} onCancel={() => setListReady(false)}>
            <div>
              <h1>Confirm Transaction</h1>
              <p>You are about to List the following items for sale on the market:</p>
              {items["toList"].map(marketItem => {
                <div style={styles.NFTs}>
                  <Card
                    style={{ width: "200px", border: "2px solid #e7eaf3" }}
                    cover={
                      <Image
                        preview={false}
                        src={marketItem.image || "error"}
                        key={marketItem.tokenId}
                        fallback="data:image/png;base64,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"
                        alt=""
                        style={{ height: "200px", width: "200px" }}
                      />
                    }
                    key={marketItem.nftCont}
                  >
                    <p>Id: {marketItem.token_id}</p>
                    {marketItem.contract_type === ["ERC1155"] && <div>{marketItem.amount1155} ERC1155 NFTs</div>}
                  </Card>
                </div>;
              })}
              <Button style={{ margin: 5 }} onClick={list}>
                List
              </Button>
            </div>
          </Modal>
        )}

        <Modal
          title={"Executing order.."}
          visible={visible2}
          onCancel={() => setVisibility2(false)}
          // onOk={}
        >
          <div></div>
        </Modal>
      </Drawer>
    </>
  );
}
export default ShoppingCart;
