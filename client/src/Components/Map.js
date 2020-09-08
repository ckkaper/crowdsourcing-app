import React, { Component } from "react";
import { Map, Marker, TileLayer, Popup, GeoJSON } from "react-leaflet";

export class MyMap extends Component {
  constructor() {
    super();
    this.state = {
      markers: [[51.505, -0.09]],
    };
  }

  addMarker = (e) => {
    const { markers } = this.state;
    this.props.addRestrictedLocations(e.latlng);
    markers.push(e.latlng);
    this.setState({ markers });
  };

  render() {
    const marker = () => {
      if (this.props.map?.point) {
        return <Marker position={this.props.map.point} />;
      }
    };

    const data = () => {
      if (this.props.map?.data.length > 0) {
        const json = this.props.map.data;
        return <GeoJSON data={json} />;
      }
    };

    return (
      <Map
        style={{ height: "500px", width: "50%" }}
        center={[38.2451076, 21.7382893]}
        zoom={13}
        onClick={this.addMarker}
      >
        <TileLayer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {this.state.markers.map((position, idx) => (
          <Marker key={`marker-${idx}`} position={position}>
            <Popup>
              <span>
                A pretty CSS3 popup. <br /> Easily customizable.
              </span>
            </Popup>
          </Marker>
        ))}
      </Map>
    );
  }
}

export default MyMap;
