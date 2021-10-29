import { renderHook, act } from '@testing-library/react-hooks'
import { AuthProvider, useAuth } from './auth';
import { mocked } from 'ts-jest/utils';
import { logInAsync } from 'expo-google-app-auth';

jest.mock('expo-google-app-auth');
 
describe('Auth Hook', () => {
  it('should be able to sign in with Google account existing', async () => {
    const googleMocked = mocked(logInAsync as any)
    googleMocked.mockReturnValueOnce({
      type: 'success',
        user: {
          id: 'any_id',
          email: 'alifer@gmail.com',
          name: 'Alifer',
          photo: 'any_photo.png'
        }
    });
    
    const {result} = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(() => result.current.signWithGoogle());

    expect(result.current.user.email)
    .toBe('alifer@gmail.com');
  });       
  
  it('user should not connect if cancel authentication with Google', async () => {
    const googleMocked = mocked(logInAsync as any)
    googleMocked.mockReturnValue({
      type: 'cancel',
    });
    
    const {result} = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(() => result.current.signWithGoogle());

    expect(result.current.user)
    .not.toHaveProperty('id');
  }); 
  
  it('should be error with incorrectly Google parameters', async () => {
    const googleMocked = mocked(logInAsync as any)
    googleMocked.mockReturnValue({
      type: 'cancel',
    });
    
    const {result} = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    try{
      await act(() => result.current.signWithGoogle());
    }catch{
      expect(result.current.user)
      .toEqual({});
    }
  });   
});