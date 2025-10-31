import React from 'react';
import { View, Button } from 'react-native';
import { printEstimationSlip, useEstimationPreview } from './PrintFormat';

export default function PrintScreen() {
  const { EstimationPreviewComponent } = useEstimationPreview();

  const handlePrintEstimation = () => {
    printEstimationSlip('FLBMG26191', 'username');
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Button
        title="Print Estimation Slip"
        onPress={handlePrintEstimation}
      />
      {EstimationPreviewComponent}
    </View>
  );
}