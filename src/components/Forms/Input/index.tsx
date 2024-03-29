import React from 'react';
import {TextInputProps} from 'react-native'

import { 
  Container, 
  
} from './style';

interface Props extends TextInputProps{
  active?: boolean;
}

export function Input({active = false, ...rest} : Props) {
  return(
    <Container {...rest} active={active}/>
  )
}