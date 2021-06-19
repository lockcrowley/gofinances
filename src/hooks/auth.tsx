import React, {createContext, ReactNode, useContext, useState, useEffect} from 'react';

import * as Google from 'expo-google-app-auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthContextData {
  user: User;
  signWithGoogle(): Promise<void>;
  signWithApple(): Promise<void>;
  signOut(): Promise<void>;  
  userStorageLoading: boolean;
}

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [userStorageLoading, setuserStorageLoading] = useState(true);
  const [user, setUser] = useState<User>({} as User);

  const userStorageKey = '@gofinances:user';

  async function signWithGoogle() {
    try{
      const result = await Google.logInAsync({
        iosClientId:'981726022196-as8srlp8eqlmjc67ls769s0310aef3bq.apps.googleusercontent.com',
        androidClientId:'981726022196-o7jlri2jdg6la37dr8vg4aol04c7ggru.apps.googleusercontent.com',
        scopes:['profile', 'email']
      });

      if(result.type === 'success'){
        const userLogged = {
          id: String(result.user.id),
          email: result.user.email!,
          name: result.user.name!,
          photo: result.user.photoUrl!
        };
        
        //Salvar dados se o usuário está ou não logado
        setUser(userLogged);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged))

      }

    }catch(error){
      throw new Error()
    }
  }

  async function signWithApple(){
    try{
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ]
      });

      if(credential) {
        const name = credential.fullName!.givenName!;
        const photo = `https://ui-avatars.com/api/?name=${name}&lenght=1`;

        const userLogged = {
          id: String(credential.user),
          email: credential.email!,
          name,
          photo,
        };
        setUser(userLogged)
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged))
      }

    }catch(error){
      throw new Error(error);
    }
  }

  async function signOut() {
    setUser({} as User);
    await AsyncStorage.removeItem(userStorageKey);
  }

  useEffect(() => {
    async function loadStorageData() {
      const userStorage = await AsyncStorage.getItem(userStorageKey);

      if(userStorage){
        const userLogged = JSON.parse(userStorage) as User;
        setUser(userLogged);
      }

      setuserStorageLoading(false);
    }

    loadStorageData();
  }, [])

  return(
    <AuthContext.Provider value={{ 
        user, 
        signWithGoogle, 
        signWithApple, 
        signOut, 
        userStorageLoading 
      }}>
      { children }
    </AuthContext.Provider>
  )
} 

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };

 