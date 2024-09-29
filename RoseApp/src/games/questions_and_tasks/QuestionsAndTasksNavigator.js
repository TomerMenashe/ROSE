import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoveQuestion from './LoveQuestion';
import PersonalQuestion from './PersonalQuestion';
import PersonalQuestionFeedback from './PersonalQuestionFeedback';

const Stack = createStackNavigator();

const QuestionsAndTasksNavigator = ({ route }) => {
  const { pin, name, selfieURL } = route.params;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="LoveQuestion"
        component={LoveQuestion}
        initialParams={{ pin, name, selfieURL }}
      />
      <Stack.Screen
        name="PersonalQuestion"
        component={PersonalQuestion}
        initialParams={{ pin, name, selfieURL }}
      />
      <Stack.Screen
        name="PersonalQuestionFeedback"
        component={PersonalQuestionFeedback}
        initialParams={{ pin, name, selfieURL }}
      />
    </Stack.Navigator>
  );
};

export default QuestionsAndTasksNavigator;
