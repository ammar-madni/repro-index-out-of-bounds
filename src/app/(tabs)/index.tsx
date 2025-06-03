import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useMarkers } from '../../hooks/useMarkers';

let imageSource = require('../../../assets/images/available_highlighted.png')

export default function App() {
  const { markers, isLoading, isRefreshing, error } = useMarkers();

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading markers: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading markers...</Text>
        </View>
      )}
      
      {isRefreshing && !isLoading && (
        <View style={styles.refreshingIndicator}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.refreshingText}>Updating...</Text>
        </View>
      )}

      <MapView style={styles.map} region={{
        latitude: 55.3781, // Center of the UK
        longitude: -3.4360,
        latitudeDelta: 10.0, // Adjust as needed
        longitudeDelta: 10.0, // Adjust as needed
      }}>
        {markers.map(marker => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            image={imageSource}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  refreshingIndicator: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 20,
    zIndex: 1000,
  },
  refreshingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
  },
});
