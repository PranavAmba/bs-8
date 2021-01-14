import *as React from 'react';
import {createDrawerNavigator} from 'react-navigation-drawer'
import { TabNavigator } from './tabNavigator';
import CustomSideBarMenu from './CSBM.js'
import Settings from '../screens/settings.js'
import MyDonations from '../screens/myDonations';
import Notification from '../screens/notification.js'
import MyReceivedBooksScreen from '../screens/myReceivedBooksScreen'
import { Icon } from 'react-native-elements';

export const DrawerNavigator=createDrawerNavigator({
    Home:{screen:TabNavigator,navigationOptions:{drawerIcon:<Icon name='home' type='fontawesome5'></Icon>}},
    Settings:{screen:Settings,navigationOptions:{drawerIcon:<Icon name='settings' type='fontawesome5'></Icon>}},
    MyDonations:{screen:MyDonations,navigationOptions:{drawerIcon:<Icon name='gift' type='font-awesome'></Icon>}},
    Notification:{screen:Notification,navigationOptions:{drawerIcon:<Icon name='bell' type='font-awesome'></Icon>}},
    ReceivedBooks:{screen:MyReceivedBooksScreen,navigationOptions:{drawerIcon:<Icon name='gift' type='font-awesome'></Icon>}}
},
{
    contentComponent:CustomSideBarMenu
},
{
    initialRouteName:'Home'
})