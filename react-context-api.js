import React, { Component } from "react";

import "../../styles/container/library.scss";

import { withRouter } from "react-router";

import { isBrowser, isMobile, isTablet } from "react-device-detect";

import Spinner from "react-spinkit";
import { DoubleBounce } from "styled-spinkit";

import qs from "qs";

import validate from "validate.js";

import styled from "styled-components";
import short from "short-uuid";

import currency from "currency.js";
import { graphql, compose } from "react-apollo";

import { addToCart } from "../../handlers/cart/cart";
import listOrders from "../../graphql/queries/order/listOrders";

import { firebase } from "@firebase/app";

import Select, { components } from "react-select";

import { CartContext } from "../../context/CartContext";

const Button = styled.div`
  font-size: 14px !important;
  line-height: 18px !important;
  letter-spacing: normal !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  color: rgb(72, 72, 72) !important;
  cursor: pointer !important;
  display: inline-block;
  padding-left: 12px !important;
  padding-right: 12px !important;
  position: relative !important;
  text-align: center !important;
  width: auto !important;
  background: #fff !important;
  border-width: 1px !important;
  border-style: solid !important;
  border-color: rgb(220, 224, 224);
  border-image: initial !important;
  border-radius: 4px !important;
  text-decoration: none !important;
  :hover {
    background: #fafafa !important;
    border-color: rgb(220, 224, 224) !important;
  }
  transition: all 0.2s ease-in-out;
`;
const NoBuyButton = styled.div`
  font-size: 22px !important;
  line-height: 18px !important;
  letter-spacing: normal !important;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
  color: #5b514a !important;
  cursor: pointer !important;
  display: inline-block;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  position: relative !important;
  text-align: center !important;
  width: auto !important;
  background: #ebebeb;
  background: linear-gradient(#fff, #ebebeb);
  border: 0.1rem solid #b5b5b5;
  border-radius: 0.4rem;
  box-shadow: inset 0 0.1rem 0 rgba(255, 255, 255, 0.2);
  border-image: initial !important;
  text-decoration: none !important;
  :hover {
    color: #333 !important;

    background: #b5b5b5;
    background: linear-gradient(to bottom, #fff, #dbdbdb);
  }
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset;
`;
const BuyButton = styled.div`
  font-size: 22px !important;
  line-height: 18px !important;
  letter-spacing: normal !important;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
  color: #5b514a !important;
  cursor: pointer !important;
  display: inline-block;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  position: relative !important;
  text-align: center !important;
  width: auto !important;
  background: #f49c65;
  background: -webkit-linear-gradient(top, #f7dfa5, #f49c65);
  background: linear-gradient(to bottom, #f7dfa5, #f49c65);
  border-width: 1px !important;
  border-style: solid !important;
  border-color: #5b514a;
  border-image: initial !important;
  border-radius: 4px !important;
  text-decoration: none !important;
  :hover {
    color: #333 !important;

    background: #e89265;
    background: -webkit-linear-gradient(top, #f5d78e, #e89265);
    background: linear-gradient(to bottom, #f5d78e, #e89265);
  }
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset;
`;

const ItemContainer = styled.div`
  justify-content: space-between;
  flex: 1;
  align-items: center;
  display: flex;
  width: 100%;
`;
const TextTruncate = styled.div`
  max-width: 23rem;

  @media (max-width: 1200px) {
    max-width: 18rem;
  }
  @media (max-width: 1050px) {
    max-width: 15rem;
  }
  @media (max-width: 960px) {
    max-width: 11rem;
  }
`;
const PriceStockBlock = styled.div`
  min-width: 100px;
`;
const ItemPrice = styled.div`
  color: #8d8d;
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
`;

const QuantityButton = styled.button`
  width: 3.2rem;
  height: 3.2rem;

  display: block;
  width: 3.2rem;
  height: 3.2rem;
  background: #fff;

  outline: none;
  cursor: pointer;
  border: none;
  font-size: 1.4rem;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -moz-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-transition: background-color 0.1s cubic-bezier(0.4, 0, 0.6, 1);
  transition: background-color 0.1s cubic-bezier(0.4, 0, 0.6, 1);
  border: 1px solid rgba(0, 0, 0, 0.09);
  border-radius: 2px;
  background: transparent;
  color: rgba(0, 0, 0, 0.8);
`;

const QuantityInput = styled.input`
  width: 5rem;
  height: 3.2rem;
  border-left: none;
  border-right: none;
  font-size: 1.6rem;
  font-weight: 400;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  text-align: center;
  cursor: text;
  border-radius: 0;

  width: 3.2rem;
  height: 3.2rem;

  display: block;
  width: 5rem;
  height: 3.2rem;
  border-left: none;
  border-right: none;
  font-size: 1.6rem;
  font-weight: 400;
  color: #ff5722;

  display: block;
  width: 3.2rem;
  height: 3.2rem;
  background: #fff;

  outline: none;
  cursor: pointer;
  border: none;
  font-size: 1.4rem;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -moz-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-transition: background-color 0.1s cubic-bezier(0.4, 0, 0.6, 1);
  transition: background-color 0.1s cubic-bezier(0.4, 0, 0.6, 1);
  border: 1px solid rgba(0, 0, 0, 0.09);
  border-radius: 2px;
  background: transparent;
  color: rgba(0, 0, 0, 0.8);
  min-width: 10rem;
`;

const Option = props => {
  let splitStr = props.label.split("::");
  let name = splitStr[0];
  let price = splitStr[1];
  let stock = splitStr[2];
  return (
    <components.Option {...props}>
      <ItemContainer>
        <TextTruncate className="fontW500 font16 text-truncate flex1 ">
          <div className="text-truncate">{name}</div>
        </TextTruncate>
        <PriceStockBlock>
          <ItemPrice className="fontW500">{price}</ItemPrice>
          <div className="font12">{stock}</div>
        </PriceStockBlock>
      </ItemContainer>
    </components.Option>
  );
};
const ValueWrapper = styled.div`
  .dummy-input-wrapper {
    .Select__single-value {
      display: none;
    }
    input {
      position: absolute;
      bottom: 0;
    }
    opacity: 0;
  }
  width: 100%;
`;
const ValueContainer = ({ children, ...props }) => {
  let splitStr = children[0].props.children.split("::");
  let name = splitStr[0];
  let price = splitStr[1];
  let stock = splitStr[2];
  return (
    <components.ValueContainer {...props}>
      <ValueWrapper>
        <ItemContainer>
          <TextTruncate className="fontW500 font16 text-truncate flex1 ">
            <div className="text-truncate">{name}</div>
          </TextTruncate>
          <div>
            <ItemPrice className="fontW500">{price}</ItemPrice>
            <div className="font12">{stock}</div>
          </div>
        </ItemContainer>
        {/* This is a hack to make the entire select clickable,
            rather than just the dropdown selector */}
        <span className="dummy-input-wrapper">{children}</span>
      </ValueWrapper>
    </components.ValueContainer>
  );
};

class CheckoutButton extends Component {
  selectRef: ElementRef<*>;
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      selected: null,
      options: [],
      error_message: "",
      desc: "",
      quantity: 0
    };
    this.addToCart = addToCart.bind(this);
  }

  componentDidMount() {
    this.loadSelected(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.product.id !== this.props.product.id) {
      this.loadSelected(nextProps);
    }
  }

  async addCart(
    showCart,
    toggleCart,
    addCart,
    createOrder,
    editCartNote,
    updateCart,
    refetchHeader,
    toggleLogIn,
    showLogIn
  ) {
    var self = this;

    let invalid = validate(
      {
        selected: this.state.selected,
        quantity: this.state.quantity
      },
      {
        selected: {
          presence: true
        },
        quantity: {
          numericality: {
            greaterThan: 0
          }
        }
      }
    );

    if (invalid) {
      console.log(invalid);
      if (invalid.selected) {
        this.setState({
          error_message: "Please select an item..."
        });
        this.selectRef.focus();
      } else if (invalid.quantity) {
        this.setState({
          error_message: "Please add some quantity..."
        });
      }

      setTimeout(() => {
        this.setState({
          error_message: ""
        });
      }, 5000);
    } else {
      import("@firebase/auth").then(() => {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            this.addToCart(
              this.props.store.id,
              this.state.selected.value.id,
              this.state.quantity,
              this.state.selected.left,
              addCart,
              editCartNote,
              updateCart,
              createOrder,
              this.props.orders.listOrders
            ).then(() => {
              this.setState({
                quantity: 0
              });
              refetchHeader();
              this.reload().then(() => {
                toggleCart(!showCart);
              });
            });
          } else {
            toggleLogIn(!showLogIn);
            this.setState({
              quantity: 0
            });
          }
        });
      });
    }
  }

  async reload() {
    await this.props.orders.refetch().then(resp => {
      let resolve = resp;
      return resolve;
    });
  }

  selectFirst(options) {
    let selected = null;

    if (this.props.product.variations_public.length === 1) {
      let left = options[0].left;
      let value = options[0].value;
      let label = options[0].label;

      selected = {
        left,
        value,
        label
      };
    }

    return selected;
  }
  async loadSelected(props) {
    this.setState({
      loading: true
    });
    let options = await this.renderOptions(props);
    let selected = await this.selectFirst(options);

    this.setState({
      loading: false,
      options: options,
      selected: selected,
      desc: "",
      quantity: 0
    });
  }
  async renderOptions(props) {
    let options = [];

    let decimal = 2;
    let symbol = "RM";

    props.product.variations_public.forEach(variation => {
      let finalCost = (variation.total_cents / Math.pow(10, decimal)).toFixed(
        2
      );

      let stock_left = variation.total_stock - variation.total_sold;

      options.push({
        value: variation,
        left: stock_left,
        label:
          variation.name +
          "::" +
          symbol +
          " " +
          currency(finalCost).format() +
          "::" +
          stock_left +
          " left"
      });
    });

    if (options.length === props.product.variations_public.length) {
      return options;
    }
  }

  renderFromCost() {
    let variations = [];

    this.props.product.variations_public.forEach(obj => {
      variations.push(obj.total_cents);
    });

    let fromCost = Math.min(...variations);

    let decimal = 2;
    let symbol = "RM";

    let finalCost = (fromCost / Math.pow(10, decimal)).toFixed(2);

    return (
      <div>
        From {symbol} {currency(finalCost).format()}
      </div>
    );
  }

  render() {
    let product = this.props.product;
    let store = this.props.store;

    if (this.state.loading || this.props.orders.loading) {
      return (
        <Button className="mr-2  mt-2 relative">
          <DoubleBounce color="#f4975e" size={18} style={{ margin: 0 }} />
        </Button>
      );
    }
    if (product.visibility === "Archived") {
      return (
        <div className="mt-2">
          <div className="font14 fontW400">Currently unavailable</div>
        </div>
      );
    }

    return (
      <div className="mt-2">
        {product.variations_public.length > 0 ? (
          <div className="font14 fontW400">{this.renderFromCost()}</div>
        ) : (
          <div className="font14 fontW400">Currently unavailable</div>
        )}

        {product.variations_public.length > 0 && (
          <Select
            ref={ref => {
              this.selectRef = ref;
            }}
            isSearchable={false}
            components={{ Option, ValueContainer }}
            value={this.state.selected}
            onChange={selectedOption => {
              this.setState({
                selected: selectedOption,
                error_message: "",
                quantity: 0
              });
            }}
            options={this.state.options}
          />
        )}

        <p className="error_message m-y-1">{this.state.error_message}</p>

        <CartContext.Consumer>
          {({
            showCart,
            toggleCart,
            addCart,
            createOrder,
            editCartNote,
            updateCart,
            refetchHeader,
            toggleLogIn,
            showLogIn
          }) => (
            <div className="m-t-1">
              {product.variations_public.length > 0 ? (
                this.state.selected ? (
                  this.state.quantity > 0 ? (
                    <BuyButton
                      onClick={() => {
                        this.addCart(
                          showCart,
                          toggleCart,
                          addCart,
                          createOrder,
                          editCartNote,
                          updateCart,
                          refetchHeader,
                          toggleLogIn,
                          showLogIn
                        );
                      }}
                    >
                      <i className="fa fa-shopping-cart" /> Add to Bag
                    </BuyButton>
                  ) : (
                    <NoBuyButton
                      onClick={() => {
                        this.addCart(
                          showCart,
                          toggleCart,
                          addCart,
                          createOrder,
                          editCartNote,
                          updateCart,
                          refetchHeader,
                          toggleLogIn,
                          showLogIn
                        );
                      }}
                    >
                      <i className="fa fa-shopping-cart" /> Choose quantity
                    </NoBuyButton>
                  )
                ) : (
                  <NoBuyButton
                    onClick={() => {
                      this.addCart(
                        showCart,
                        toggleCart,
                        addCart,
                        createOrder,
                        editCartNote,
                        updateCart,
                        refetchHeader,
                        toggleLogIn,
                        showLogIn
                      );
                    }}
                  >
                    <i className="fa fa-shopping-cart" /> Select an item
                  </NoBuyButton>
                )
              ) : null}
            </div>
          )}
        </CartContext.Consumer>
      </div>
    );
  }
}

export default compose(
  graphql(listOrders, {
    options: ownProps => ({
      variables: {
        userId: ownProps.userId,
        storeId: ownProps.store.id,
        filter: {
          order_status: {
            eq: "cart"
          }
        }
      }
    }),
    props: props => ({
      orders: props.data
    })
  })
)(withRouter(CheckoutButton));
