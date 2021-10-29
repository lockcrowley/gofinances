import React, {useState, useEffect} from 'react';
import {Keyboard, Modal, TouchableWithoutFeedback, Alert} from 'react-native';
import * as Yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import uuid from 'react-native-uuid';

import { InputForm } from '../../components/Forms/InputForm';
import { Button } from '../../components/Forms/Button';
import { CategorySelectButton } from '../../components/Forms/CategorySelectButton';
import { TransactionTypeButton } from '../../components/Forms/TransactionTypeButton';

import { useAuth } from '../../hooks/auth';
import {CategorySelect} from '../CategorySelect';

import { 
  Container, 
  Header,
  Title,
  Form,
  Fields,
  TransactionsTypes,
} from './style';


interface FormData{
  name: string;
  amount: string;
}

const schema = Yup.object().shape({
  name:Yup
  .string()
  .required('O nome é obrigatório'),
  amount:Yup
  .number()
  .typeError('Informe um valor númerico')
  .positive('O valor não pode ser negativo')
  .required('O valor é obrigatório')
});

export function Register () {
  const [transactionType, setTransactionType] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)

  const {user} = useAuth();

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria',
  });

  const navigation = useNavigation();

  const {
    control, 
    handleSubmit,
    reset,
    formState: { errors }

  } = useForm({
    resolver: yupResolver(schema)
  });

  function handleTransactionsTypeSelect(type: 'positive' | 'negative'){
    setTransactionType(type);
  }

  function handleSelectionCloseCategoryModal() {
    setCategoryModalOpen(false);
  }

  function handleSelectionOpenCategoryModal() {
    setCategoryModalOpen(true);
  }

  async function handleRegister(form: FormData ){
    if(!transactionType)
      return Alert.alert('Selecione o tipo da transação');

      if(category.key === 'category')
      return Alert.alert('Selecione a categoria');

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.key,
      date: new Date()
    }

  //Salvando dados no AsyncStorage

    try {
      const dataKey = `@gofinances:transactions_user:${user.id}`;

      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];

      const dataFormated = [
        ...currentData, 
        newTransaction
      ];

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormated));

      reset();
      setTransactionType('');
      setCategory({
        key: 'category',
        name: 'Categoria',
      });
      navigation.navigate('Listagem')

    }catch(error){
      console.log(error);
      Alert.alert('Não foi possível salvar')
    }
   }

  //Pegando dados do AsyncStorage

  // useEffect(() => {
  //   async function loadData(){
  //   const data = await AsyncStorage.getItem(`@gofinances:transactions_user:${user.id}`);
  //   console.log(JSON.parse(data!))
  //   }

  //   loadData();
 
  //   //Limpar dados do AsyncStorage
  //   async function removeAll() {
  //     await AsyncStorage.removeItem(`@gofinances:transactions_user:${user.id}`);
  //   }

  //   removeAll();
  // }, [])

  return(
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>
            Cadastro
          </Title>
        </Header>
        <Form>
          <Fields>
            <InputForm
              name="name"
              control={control}
              placeholder="Nome"
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />
            <InputForm
              name="amount"
              control={control}
              placeholder="Preço"
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
            />
            
            <TransactionsTypes>
              <TransactionTypeButton
                type="up"
                title="Income"
                onPress={() => handleTransactionsTypeSelect('positive')}
                isActive={transactionType === 'positive'}
              />
              <TransactionTypeButton
                type="down"
                title="Outcome"
                onPress={() => handleTransactionsTypeSelect('negative')}
                isActive={transactionType === 'negative'}
              />
            </TransactionsTypes>

            <CategorySelectButton 
              testID="button-category"
              title={category.name} 
              onPress={handleSelectionOpenCategoryModal}
            />
          </Fields>

          <Button
            title="Enviar"
            onPress={handleSubmit(handleRegister)}
          />
        </Form>

        <Modal testID="modal-category" visible={categoryModalOpen}>
          <CategorySelect 
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleSelectionCloseCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  )
}