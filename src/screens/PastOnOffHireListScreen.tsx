import React from 'react'
import { ThemedText } from '../components/ThemedText'
import { View } from 'react-native'
import { usePastOnOffHireList } from '../hooks/usePastOnOffHireList';

export default function PastOnOffHireListScreen() {
  const { data, isLoading } = usePastOnOffHireList();  
  

  return (
    <View><ThemedText>PastOnOffHireListScreen</ThemedText></View>

  )
}
