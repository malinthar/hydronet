import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { Address, searchAddresses } from '@/libs/addressApi';
import { FloodPrediction, getFloodPrediction } from '@/libs/floodApi';
import { submitFloodObservation } from '@/libs/observationApi';

interface PredictionResult extends FloodPrediction {}

export default function HomeScreen() {
  const [location, setLocation] = useState('');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [addressSuggestions, setAddressSuggestions] = useState<Address[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showInputForm, setShowInputForm] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observedDepth, setObservedDepth] = useState('');
  const [observationNotes, setObservationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [observedDate, setObservedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  // Function to handle address search
  const handleAddressSearch = async (text: string) => {
    setLocation(text);
    
    if (text.trim().length < 2) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const suggestions = await searchAddresses(text);
      // Limit to 5 suggestions to prevent performance issues
      setAddressSuggestions(suggestions.slice(0, 5));
    } catch (error) {
      console.error('Error searching addresses:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Updated function to handle address selection
  const handleAddressSelect = (address: Address) => {
    setLocation(address.fullAddress);
    setSelectedAddress(address); // Store the entire address object
    setAddressSuggestions([]);
  };

  // Update handleGetMap function to properly show the map
  const handleGetMap = () => {
    setIsLoading(true);
    setShowInputForm(false);
    setShowResults(false);
    setShowMap(true); // Set showMap to true
    setIsLoading(false);
  }
  
  const handleGetPrediction = async () => {
    // Show loading state
    setIsLoading(true);
    
    try {
      // Get prediction from the API
      const prediction = await getFloodPrediction(selectedAddress, location);
      
      // Update state with the prediction
      setPredictionResult(prediction);
      setActiveStepIndex(0);
      setShowInputForm(false);
      setShowResults(true);
      setShowMap(false);
    } catch (error) {
      console.error('Error getting flood prediction:', error);
      Alert.alert('Error', 'Failed to get flood prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset function to go back to input form
  const handleNewPrediction = () => {
    setShowInputForm(true);
    setShowResults(false);
    setShowMap(false);
  };

  // Function to submit observation data
  const handleSubmitObservation = async () => {
    if (!observedDepth) return;
    
    setIsSubmitting(true);
    
    try {
      const depth = parseFloat(observedDepth);
      if (isNaN(depth)) {
        throw new Error('Invalid depth value');
      }
      
      await submitFloodObservation(
        selectedAddress,
        location,
        depth,
        observationNotes,
        observedDate,
        selectedPhotos // Pass the selected photos
      );
      
      // Reset form and show success message
      setObservedDepth('');
      setObservationNotes('');
      setObservedDate(new Date());
      setSelectedPhotos([]); // Reset photos
      setSubmissionSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmissionSuccess(false);
        setShowObservationForm(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting observation:', error);
      Alert.alert('Error', 'Failed to submit observation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to format time display with both relative and absolute time
  const formatTimeDisplay = (date: Date): string => {
    // Format hours and minutes with leading zeros if needed
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getRiskColor = (risk: string) => {
    switch(risk.toLowerCase()) {
      case 'low': return '#4CAF50'; // Green - matches safe water level
      case 'moderate': return '#FFC107'; // Yellow - matches warning water level
      case 'high': return '#F44336'; // Red - matches danger water level
      case 'severe': return '#F44336'; // Also red for severe
      default: return '#FFC107'; // Default to warning yellow
    }
  };

  // New function to get color based on water depth
  const getWaterLevelColor = (depth: string) => {
    const depthValue = parseFloat(depth);
    if (depthValue < 0.3) return '#4CAF50'; // Safe - green
    if (depthValue < 0.5) return '#FFC107'; // Warning - yellow
    return '#F44336'; // Danger - red
  };

  // Function to generate Google Maps HTML content
  const getMapHTML = () => {
    // Default to San Francisco if no prediction result
    const defaultLat = 37.7749;
    const defaultLng = -122.4194;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            function initMap() {
              const map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: ${defaultLat}, lng: ${defaultLng} },
                zoom: 12,
              });
              
              new google.maps.Marker({
                position: { lat: ${defaultLat}, lng: ${defaultLng} },
                map,
                title: "Flood risk location"
              });
            }
          </script>
          <script src="https://maps.googleapis.com/maps/api/js?callback=initMap" async defer></script>
        </body>
      </html>
    `;
  };

  // Updated OpenStreetMap function to show flood extents for different time steps
  const getOpenStreetMapHTML = () => {
    const defaultLat = -41.2865;
    const defaultLng = 174.7762;
    
    const lat = selectedAddress?.coordinates?.latitude || defaultLat;
    const lng = selectedAddress?.coordinates?.longitude || defaultLng;
    
    const locationText = predictionResult ? 
      `${predictionResult.location}` : 
      selectedAddress ? selectedAddress.fullAddress : "Default Location";
    
    const currentStep = predictionResult?.steps[activeStepIndex];
    const floodDepth = currentStep ? parseFloat(currentStep.depth) : 0;
    const floodColor = currentStep ? getWaterLevelColor(currentStep.depth) : '#4FA3C1';
    const floodRadius = floodDepth * 200;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
            .flood-risk-popup { font-weight: bold; color: #4FA3C1; }
            .depth-info { margin-top: 5px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            const map = L.map('map').setView([${lat}, ${lng}], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            L.marker([${lat}, ${lng}]).addTo(map)
              .bindPopup('<div class="flood-risk-popup">Location:</div>${locationText}' + 
                        ${currentStep ? `'<div class="depth-info">Water depth: ${currentStep.depth}m</div>'` : `''`})
              .openPopup();
            
            ${predictionResult ? `
              const floodCircle = L.circle([${lat}, ${lng}], {
                color: '${floodColor}',
                fillColor: '${floodColor}',
                fillOpacity: 0.3,
                radius: ${floodRadius}
              }).addTo(map);
              
              const textLatLng = L.latLng(${lat}, ${lng}).toBounds(${floodRadius}).getNorthEast();
              L.marker(textLatLng, {
                icon: L.divIcon({
                  className: 'flood-depth-label',
                  html: '<div style="background-color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; border: 1px solid ${floodColor};">Depth: ${currentStep?.depth}m</div>',
                  iconSize: [100, 20],
                  iconAnchor: [50, 10]
                })
              }).addTo(map);
            ` : ''}
          </script>
        </body>
      </html>
    `;
  };

  // Add date/time helper functions
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      // Preserve the current time when changing the date
      const newDate = new Date(selectedDate);
      newDate.setHours(observedDate.getHours(), observedDate.getMinutes());
      setObservedDate(newDate);
    }
  };
  
  // Handle time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (selectedTime) {
      // Preserve the current date when changing the time
      const newDate = new Date(observedDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setObservedDate(newDate);
    }
  };

  // Photo selection functions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const selectFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset: ImagePicker.ImagePickerAsset) => asset.uri);
      setSelectedPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Limit to 5 photos
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: selectFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1E3A8A', dark: '#0B0F1A' }}
      headerImage={
        <View style={styles.headerHeroContainer}>
          <View style={styles.heroIconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="water-outline" size={38} color="#FFFFFF" />
            </View>
          </View>
          <ThemedText type="title" style={styles.appTitle}>HYDRONET</ThemedText>
          <View style={styles.taglineContainer}>
            <ThemedText style={[styles.tagline, { color: '#72B7D5' }]}>
              AI-Powered Flood Forecasts
            </ThemedText>
          </View>
        </View>
      }
      showHeader={true}
    >
      
      {/* Input Section */}
      {showInputForm ? (
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            Enter Your Location <Ionicons name="location" size={22} color="#4FA3C1" />
          </Text>
          
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Where are you located?</Text>
            <View style={styles.enhancedInputWrapper}>
              <Ionicons name="home" size={22} color="#4FA3C1" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your address or place name"
                value={location}
                onChangeText={handleAddressSearch}
                placeholderTextColor="#999"
                textAlign="left"
                numberOfLines={1}
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#4FA3C1" style={styles.searchIndicator} />
              )}
            </View>
            
            {/* Address Suggestions */}
            {addressSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {addressSuggestions.map(item => (
                  <TouchableOpacity 
                    key={item.id}
                    style={styles.suggestionItem}
                    onPress={() => handleAddressSelect(item)}
                  >
                    <Ionicons name="location-outline" size={18} color="#4FA3C1" />
                    <Text style={styles.suggestionText} numberOfLines={1} ellipsizeMode="tail">
                      {item.fullAddress}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.predictButton}
            onPress={handleGetPrediction}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="analytics" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Get Flood Forecasts</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : showMap ? (
        // Map View
        <View style={styles.mapContainer}>
          {/* Branding bar */}
          <View style={styles.brandingBar}>
            <View style={styles.brandingContent}>
              <Ionicons name="water-outline" size={18} color="#4FA3C1" />
              <Text style={styles.brandingText}>HYDRONET</Text>
            </View>
            <TouchableOpacity 
              style={styles.newPredictionButton}
              onPress={handleNewPrediction}
            >
              <Ionicons name="search" size={16} color="#4FA3C1" />
              <Text style={styles.newPredictionText}>New Search</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.resultsTitleRow}>
            <Ionicons name="map" size={24} color="#4FA3C1" />
            <ThemedText type="subtitle" style={styles.resultsTitle}>
              Flood Extent Map
            </ThemedText>
          </View>

          {predictionResult && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.locationText}>
                {predictionResult.location}
              </Text>
            </View>
          )}
          
          {/* Time step selector */}
          {predictionResult && (
            <View style={styles.timeStepSelector}>
              <Text style={styles.timeStepHeader}>Forecast Timeline:</Text>
              <View style={styles.timeStepButtons}>
                {predictionResult.steps.map((step, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeStepButton,
                      { backgroundColor: `${getWaterLevelColor(step.depth)}40` },
                      activeStepIndex === index && {
                        backgroundColor: getWaterLevelColor(step.depth),
                        borderWidth: 2,
                        borderColor: '#FFFFFF'
                      }
                    ]}
                    onPress={() => setActiveStepIndex(index)}
                  >
                    <Text style={[
                      styles.timeStepButtonText,
                      { color: activeStepIndex === index ? '#FFFFFF' : '#333333' }
                    ]}>
                      +{index + 1}h
                    </Text>
                    <Text style={[
                      styles.timeStepTimeText,
                      { color: activeStepIndex === index ? '#FFFFFF' : '#555555' }
                    ]}>
                      {step.timestamp}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          <View style={styles.map}>
            <WebView
              key={activeStepIndex}
              style={styles.mapView}
              originWhitelist={['*']}
              source={{ html: getOpenStreetMapHTML() }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
          
          {/* Legend */}
          {predictionResult && (
            <View style={styles.mapLegend}>
              <Text style={styles.mapLegendTitle}>Flood Depth</Text>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: '#4CAF50'}]} />
                  <Text style={styles.legendText}>{'<0.3m - Low'}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: '#FFC107'}]} />
                  <Text style={styles.legendText}>0.3-0.5m - Warning</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: '#F44336'}]} />
                  <Text style={styles.legendText}>{'>0.5m - Danger'}</Text>
                </View>
              </View>
            </View>
          )}
          
          {predictionResult && (
            <TouchableOpacity 
              style={styles.predictButton}
              onPress={() => {
                setShowMap(false);
                setShowResults(true);
              }}
            >
              <Ionicons name="analytics" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>View Flood Forecast</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : predictionResult && showResults ? (  
        <View style={styles.resultsFullScreen}>
          {/* Branding bar */}
          <View style={styles.brandingBar}>
            <View style={styles.brandingContent}>
              <Ionicons name="water-outline" size={18} color="#4FA3C1" />
              <Text style={styles.brandingText}>HYDRONET</Text>
            </View>
            <TouchableOpacity 
              style={styles.newPredictionButton}
              onPress={handleNewPrediction}
            >
              <Ionicons name="search" size={16} color="#4FA3C1" />
              <Text style={styles.newPredictionText}>New Search</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.resultsTitleRow}>
            <Ionicons name="stats-chart" size={24} color="#4FA3C1" />
            <ThemedText type="subtitle" style={styles.resultsTitle}>
              Latest Forecasts at Your Location
            </ThemedText>
          </View>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.locationText}>
              {predictionResult.location}
            </Text>
          </View>
          
          {/* Time step selector */}
          <View style={styles.timeStepSelector}>
            <Text style={styles.timeStepHeader}>Forecast Timeline:</Text>
            <View style={styles.timeStepButtons}>
              {predictionResult.steps.map((step, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeStepButton,
                    { backgroundColor: `${getWaterLevelColor(step.depth)}40` },
                    activeStepIndex === index && {
                      backgroundColor: getWaterLevelColor(step.depth),
                      borderWidth: 2,
                      borderColor: '#FFFFFF'
                    }
                  ]}
                  onPress={() => setActiveStepIndex(index)}
                >
                  <Text style={[
                    styles.timeStepButtonText,
                    { color: activeStepIndex === index ? '#FFFFFF' : '#333333' }
                  ]}>
                    +{index + 1}h
                  </Text>
                  <Text style={[
                    styles.timeStepTimeText,
                    { color: activeStepIndex === index ? '#FFFFFF' : '#555555' }
                  ]}>
                    {step.timestamp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Current step display */}
          <View style={styles.waterDepthContainer}>
            <View style={styles.depthTextContainer}>
              <Text style={styles.depthValue}>
                {predictionResult.steps[activeStepIndex].depth}
              </Text>
              <Text style={styles.depthUnit}>meters</Text>
            </View>
            
            <View style={styles.visualizationContainer}>
              <View style={styles.waterAnimation}>
                <View style={[
                  styles.waterLevel, 
                  { 
                    height: Math.min(parseFloat(predictionResult.steps[activeStepIndex].depth) * 100, 170),
                    backgroundColor: `${getWaterLevelColor(predictionResult.steps[activeStepIndex].depth)}80`
                  }
                ]} />
                {/* Reference lines */}
                <View style={styles.warningLine}>
                  <Text style={styles.warningText}>0.3m</Text>
                </View>
                <View style={styles.dangerLine}>
                  <Text style={styles.dangerText}>0.5m</Text>
                </View>
              </View>
              
              <View style={styles.houseContainer}>
                <View style={styles.houseIconContainer}>
                  {/* Water level overlay on house */}
                  <View 
                    style={[
                      styles.houseWaterOverlay,
                      { 
                        height: Math.min(parseFloat(predictionResult.steps[activeStepIndex].depth) * 100, 190),
                        backgroundColor: `${getWaterLevelColor(predictionResult.steps[activeStepIndex].depth)}80`
                      }
                    ]} 
                  />
                  <Ionicons 
                    name="home"
                    size={200}
                    color={parseFloat(predictionResult.steps[activeStepIndex].depth) >= 0.5 ? 
                      getWaterLevelColor(predictionResult.steps[activeStepIndex].depth) : 
                      "#666"
                    } 
                  />
                </View>
              </View>
            </View>

            {/* Add Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, {borderColor: '#FFC107'}]} />
                <Text style={styles.legendText}>0.3-0.5m - Warning</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, {borderColor: '#F44336'}]} />
                <Text style={styles.legendText}>&gt;=0.5m - Danger</Text>
              </View>
            </View>
          </View>

          <View style={styles.resultDetails}>
            <View style={styles.resultRow}>
              <Text>Risk Level:</Text>
              <View style={[
                styles.riskBadge, 
                { backgroundColor: getRiskColor(predictionResult.steps[activeStepIndex].risk) }
              ]}>
                <Text style={styles.riskText}>
                  {predictionResult.steps[activeStepIndex].risk}
                </Text>
              </View>
            </View>
            
            <View style={styles.resultRow}>
              <Text>Forecast Time:</Text>
              <View style={styles.timeInfo}>
                <Text>+{activeStepIndex + 1}h ({predictionResult.steps[activeStepIndex].timestamp})</Text>
              </View>
            </View>
            
            <View style={[
              styles.safetySuggestion,
              { 
                backgroundColor: `${getWaterLevelColor(predictionResult.steps[activeStepIndex].depth)}25`,
                borderColor: getWaterLevelColor(predictionResult.steps[activeStepIndex].depth),
                borderWidth: 1
              }
            ]}>
              <Ionicons 
                name="information-circle" 
                size={20} 
                color={getWaterLevelColor(predictionResult.steps[activeStepIndex].depth)} 
              />
              <ThemedText style={styles.safetySuggestionText}>
                {parseFloat(predictionResult.steps[activeStepIndex].depth) >= 0.5 ? 
                  "High risk area! Consider evacuation and stay informed through local alerts." :
                  parseFloat(predictionResult.steps[activeStepIndex].depth) >= 0.3 ? 
                  "Moderate risk. Be prepared for rising water levels. Keep monitoring updates." : 
                  "Low risk currently. Continue to monitor local weather updates."}
              </ThemedText>
            </View>
          </View>

          {/* Legend */}
          {predictionResult && (
            <View style={styles.mapLegend}>
              <Text style={styles.mapLegendTitle}>Flood Depth</Text>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: '#4CAF50'}]} />
                  <Text style={styles.legendText}>{'<0.3m - Low'}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: '#FFC107'}]} />
                  <Text style={styles.legendText}>0.3-0.5m - Warning</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, {backgroundColor: '#F44336'}]} />
                  <Text style={styles.legendText}>{'>0.5m - Danger'}</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Observation Form Toggle Button */}
          <TouchableOpacity 
            style={styles.observationButton}
            onPress={() => setShowObservationForm(!showObservationForm)}
          >
            <Ionicons name="water-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {showObservationForm ? 'Cancel' : 'Report Actual Flood Depth'}
            </Text>
          </TouchableOpacity>

          {/* Observation Form */}
          {showObservationForm && (
            <View style={styles.observationForm}>
              <Text style={styles.observationTitle}>
                Report Actual Flood Depth at Your Location
              </Text>
              
              <View style={styles.observationInputContainer}>
                <Text style={styles.observationLabel}>Measured Water Depth (meters):</Text>
                <TextInput
                  style={styles.observationInput}
                  value={observedDepth}
                  onChangeText={setObservedDepth}
                  placeholder="Enter depth (e.g., 0.4)"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>
              
              {/* Date and Time Pickers */}
              <View style={styles.dateTimeSelectors}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#4FA3C1" />
                  <Text style={styles.dateTimeText}>
                    {formatDate(observedDate)}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color="#4FA3C1" />
                  <Text style={styles.dateTimeText}>
                    {formatTime(observedDate)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Add photo selection */}
              <View style={styles.observationInputContainer}>
                <Text style={styles.observationLabel}>Photos (optional):</Text>
                
                {/* Photo grid */}
                {selectedPhotos.length > 0 && (
                  <View style={styles.photoGrid}>
                    {selectedPhotos.map((photo, index) => (
                      <View key={index} style={styles.photoContainer}>
                        <Image source={{ uri: photo }} style={styles.photoPreview} />
                        <TouchableOpacity 
                          style={styles.removePhotoButton}
                          onPress={() => removePhoto(index)}
                        >
                          <Ionicons name="close-circle" size={24} color="#F44336" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Add photo button */}
                {selectedPhotos.length < 5 && (
                  <TouchableOpacity 
                    style={styles.addPhotoButton}
                    onPress={showPhotoOptions}
                  >
                    <Ionicons name="camera-outline" size={24} color="#4FA3C1" />
                    <Text style={styles.addPhotoText}>
                      {selectedPhotos.length === 0 ? 'Add Photos' : `Add More (${5 - selectedPhotos.length} remaining)`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.observationInputContainer}>
                <Text style={styles.observationLabel}>Notes (optional):</Text>
                <TextInput
                  style={[styles.observationInput, styles.observationTextarea]}
                  value={observationNotes}
                  onChangeText={setObservationNotes}
                  placeholder="Any additional observations"
                  placeholderTextColor="#999"
                  multiline
                />
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!observedDepth || isSubmitting) && styles.disabledButton
                ]}
                onPress={handleSubmitObservation}
                disabled={!observedDepth || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Submit Observation</Text>
                  </>
                )}
              </TouchableOpacity>
              
              {submissionSuccess && (
                <View style={styles.successMessage}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.successText}>
                    Thank you for your contribution!
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Map button */}
          <TouchableOpacity 
            style={[styles.viewMapButton, showObservationForm && {marginTop: 8}]}
            onPress={handleGetMap}
          >
            <Ionicons name="map" size={20} color="#FFFFFF" />
            <Text style={styles.viewMapButtonText}>View Flood Inundation Map</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Hydronet • AI-Powered Flood Prediction</Text>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeText: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  headerHeroContainer: {
    padding: 20,
    paddingTop: 35,
    paddingBottom: 5,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  heroIconContainer: {
    paddingBottom: 16,
  },
  iconBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  taglineContainer: {
    marginBottom: 8,
  },
  tagline: {
    color: '#4FA3C1',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionText: {
    color: '#BDC3C7',
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#4FA3C1',
    fontSize: 20,
    fontWeight: '600',
  },
  inputField: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  enhancedInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    paddingHorizontal: 6,
  },
  inputIcon: {
    padding: 12,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  predictButton: {
    backgroundColor: '#4FA3C1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsFullScreen: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  brandingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    marginBottom: 16,
  },
  brandingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandingText: {
    color: '#4FA3C1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  resultsTitle: {
    color: '#4FA3C1',
    fontSize: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  timeStepSelector: {
    marginBottom: 20,
  },
  timeStepHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeStepButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeStepButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 2,
    alignItems: 'center',
    minWidth: 70,
  },
  timeStepButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  timeStepTimeText: {
    fontSize: 12,
    marginTop: 2,
  },
  waterDepthContainer: {
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  depthTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  depthValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4FA3C1',
  },
  depthUnit: {
    fontSize: 20,
    color: '#888',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  visualizationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
    paddingHorizontal: 10,
  },
  waterAnimation: {
    width: 36,
    height: 160,
    borderWidth: 2,
    borderColor: '#4FA3C1',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  waterLevel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  warningLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 25,
    borderWidth: 1,
    borderColor: '#FFC107',
    borderStyle: 'dashed',
    alignItems: 'flex-end',
  },
  warningText: {
    color: '#FFC107',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    right: -38,
    top: -10,
  },
  dangerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 45,
    borderWidth: 1,
    borderColor: '#F44336',
    borderStyle: 'dashed',
    alignItems: 'flex-end',
  },
  dangerText: {
    color: '#F44336',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    right: -38,
    top: -10,
  },
  houseContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 180,
    marginLeft: 6
  },
  houseIconContainer: {
    position: 'relative',
    height: 180,
    width: 180,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  houseWaterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  houseLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  resultDetails: {
    backgroundColor: '#F5F8FA',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  riskText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  safetySuggestion: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
    alignItems: 'flex-start',
    gap: 10,
  },
  safetySuggestionText: {
    flex: 1,
    fontWeight: '600',
    color: '#333333',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    color: '#888',
    fontSize: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  suggestionsContainer: {
    marginTop: 4,
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  searchIndicator: {
    marginRight: 10,
  },
  newPredictionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  newPredictionText: {
    color: '#4FA3C1',
    fontSize: 12,
    fontWeight: '500',
  },
  legendContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendLine: {
    width: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  viewMapButton: {
    backgroundColor: '#4FA3C1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  viewMapButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    minHeight: 500,
  },
  map: {
    height: 400,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
  mapLegend: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  mapLegendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  observationButton: {
    backgroundColor: '#72B7D5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  observationForm: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  observationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  observationInputContainer: {
    marginBottom: 12,
  },
  observationLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  observationInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  observationTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4FA3C1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    gap: 8,
  },
  successText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  dateTimeSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    flex: 0.48,
    justifyContent: 'center',
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  photoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F8FA',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FA',
    borderWidth: 2,
    borderColor: '#E1E8ED',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  addPhotoText: {
    color: '#4FA3C1',
    fontSize: 16,
    fontWeight: '500',
  },
});
