import React from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { categories } from '../../utils/categories';
import {Button} from '../../components/Forms/Button';

import {
  Container,
  Header,
  Title,
  Category,
  Icon,
  Name,
  Separetor,
  Footer,
  
  
} from './style';

interface Category {
  key: string;
  name: string;
}

interface Props{
  category: Category;
  setCategory: (category: Category) => void;
  closeSelectCategory: () => void;

}

export function CategorySelect({ category, setCategory, closeSelectCategory } : Props){

  function handleSelectCategory(category: Category){
    setCategory(category);
  }

  return(
    <Container>
      <Header>
        <Title>Categoria</Title>
      </Header>

      <FlatList
        data={categories}
        style={{flex:1, width:'100%'}}
        keyExtractor={(item) => item.key}
        renderItem={({item}) => (
          <Category 
            onPress={() => handleSelectCategory(item)} 
            isActive={category.key === item.key}
          >
            <Icon name={item.icon}/>
            <Name>{item.name}</Name>
          </Category>
        )}
        ItemSeparatorComponent={() => <Separetor />}
      />

      <Footer>
       <Button title="Selecionar" onPress={closeSelectCategory}/>
      </Footer>
    </Container>
  )
}