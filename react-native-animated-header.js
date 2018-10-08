import React from "react";
import { Grid, Col } from "react-native-easy-grid";
import { Content, Text, Button, Spinner } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import HTMLView from "react-native-htmlview";
import {
  Platform,
  StyleSheet,
  Linking,
  Animated,
  FlatList,
  Dimensions,
  ScrollView,
  RefreshControl,
  PanResponder,
  Image,
  View,
  TouchableOpacity,
  PixelRatio
} from "react-native";
import { graphql, compose } from "react-apollo";
import { remove } from "lodash";
import moment from "moment";

import AddGuideId from "../../mutations/hopon/AddGuideId";
import RemoveGuideId from "../../mutations/hopon/RemoveGuideId";

import Carousel from "react-native-carousel-view";

import { NavigationActions } from "react-navigation";
import StarRating from "react-native-star-rating";
import Modal from "react-native-modal";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

type Props = {
  data: Object,
  navigation: Object,
  hasHopped: boolean
};

class Service extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    //title: navigation.state.params.title,
    headerStyle: {
      backgroundColor: "transparent"
    }
    //headerLeft: (<View></View>),
  });
  constructor(props) {
    super(props);
    this.state = {
      hasHopped: false,
      modalRemove: false,
      modalAdd: false,
      loading: false,
      scrollY: new Animated.Value(0)
    };
    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        if (
          gestureState.dx < 20 &&
          gestureState.dx > -20 &&
          (gestureState.dy < 20 && gestureState.dy > -20)
        ) {
          return false;
        }

        return true;
      }
    });
  }
  componentDidMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        if (
          gestureState.dx < 20 &&
          gestureState.dx > -20 &&
          (gestureState.dy < 20 && gestureState.dy > -20)
        ) {
          return false;
        }

        return true;
      }
    });
    this.loadProp();
  }

  loadProp() {
    this.setState({
      hasHopped: this.props.hasHopped
    });
  }

  remove() {
    this.props.remove({
      variables: { service_id: this.props.id }
    });
    this.setState({
      hasHopped: false,
      modalRemove: false
    });
  }

  add() {
    this.props.add({
      variables: { service_id: this.props.id }
    });
    this.setState({
      hasHopped: true,
      modalAdd: false
    });
  }

  renderNode(node, index) {
    if (node.name == "img") {
      const { src } = node.attribs;
      return (
        <Image
          key={index}
          style={{
            width: 500 * PixelRatio.get(),
            height: 200 * PixelRatio.get()
          }}
          source={{ uri: src }}
        />
      );
    }
  }

  render() {
    let fullWidth = Dimensions.get("window").width;

    const {
      id,
      title,
      avatar_url,
      average_rating,
      price_cents,
      price_currency,
      approved_reservations_count,
      type,
      hopon_guide_ids,
      img_urls,
      price_overtime_cents,
      price_overtime_currency,
      included,
      excluded,
      description,
      tags
    } = this.props.data.service_info;

    const HEADER_MAX_HEIGHT = (fullWidth / 10) * 6 + 30;
    const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 75 : 50;
    const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

    const headerHeight = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      extrapolate: "clamp"
    });
    const imageOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 0, 0],
      extrapolate: "clamp"
    });
    const imageOpacityRev = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [0, 0, 1],
      extrapolate: "clamp"
    });
    const imageTranslate = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, 0],
      extrapolate: "clamp"
    });

    if (this.props.data.loading || !this._panResponder) {
      return (
        <View style={styles.center}>
          <Spinner />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: "#ffffff" }}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { y: this.state.scrollY } } }
          ])}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.props.data.refetch}
              tintColor="#fff"
              title="Drag to refresh"
              colors={["#fff", "#fff", "#fff"]}
              progressBackgroundColor="#107A99"
            />
          }
        >
          <View style={{ marginTop: HEADER_MAX_HEIGHT }}>
            <View style={{ flex: 1, padding: 10 }}>
              <Text style={{ fontSize: hp("3%") }}>{title}</Text>

              <View style={{ width: 100, paddingTop: 10, paddingBottom: 10 }}>
                <StarRating
                  disabled={true}
                  maxStars={5}
                  emptyStar="star"
                  halfStar="star-half"
                  emptyStarColor="#dce0e4"
                  fullStarColor="#56c8dc"
                  halfStarColor="#56c8dc"
                  halfStarEnabled={true}
                  starSize={15}
                  rating={parseFloat(average_rating)}
                />
              </View>
            </View>
          </View>
        </ScrollView>
        <Animated.View
          style={{
            height: headerHeight,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            width: null,
            transform: [{ translateY: imageTranslate }],

            backgroundColor: "#fff"
          }}
        />

        <Animated.View
          style={{
            flex: 1,
            padding: 20,
            height: headerHeight,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            overflow: "hidden",
            backgroundColor: "#56c8dc"
          }}
        >
          <Animated.View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              paddingTop: Platform.OS === "ios" ? 30 : 0,
              flex: 1,
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              height: headerHeight
            }}
          >
            <Text style={{ color: "#0d6879" }}>Service</Text>
          </Animated.View>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.dispatch(
                NavigationActions.back({
                  key: null
                })
              );
            }}
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 30 : 4,
              left: 9,
              padding: 10
            }}
          >
            <Ionicons name="ios-arrow-back" size={24} color="#0d6879" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            opacity: imageOpacity,
            height: headerHeight
          }}
          {...this._panResponder.panHandlers}
        >
          <Carousel
            width={fullWidth}
            height={HEADER_MAX_HEIGHT}
            animate={false}
            indicatorAtBottom={true}
            indicatorSize={20}
            indicatorColor="#56c8dc"
            inactiveIndicatorColor="#dce0e4"
          >
            {img_urls.map(image => {
              return (
                <View
                  key={image}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Animated.Image
                    resizeMethod="resize"
                    source={{ uri: image }}
                    style={{
                      height: headerHeight,
                      width: fullWidth,

                      backgroundColor: "#ccc"
                    }}
                  />
                </View>
              );
            })}
          </Carousel>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.dispatch(
                NavigationActions.back({
                  key: null
                })
              );
            }}
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 30 : 4,
              left: 9,
              padding: 10
            }}
          >
            <Ionicons name="ios-arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewheaderStyle: {
    backgroundColor: "#fff",
    alignSelf: "center"
  }
});

export default compose(
  graphql(AddGuideId, { name: "add" }),
  graphql(RemoveGuideId, { name: "remove" })
)(Service);
