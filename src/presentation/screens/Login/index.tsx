/* eslint-disable curly */
import React, {useCallback, useEffect, useState} from 'react';

import {Button} from '@/presentation/components/Button';
import {Input} from '@/presentation/components/Input';
import {ErrorMessage} from '@/presentation/components/ErrorMessage';
import Spinner from '@/presentation/components/Spinner';
import LinkButton from '@/presentation/components/LinkButton';
import {Validation} from '@/presentation/protocols/validation';
import {Authentication} from '@/domain/usecases/authentication';
import {Container} from './styles';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '@/presentation/context/auth-context';
import {AccountModel} from '@/domain/models';

type LoginProps = {
  validation: Validation;
  authentication: Authentication;
};

export const Login: React.FC<LoginProps> = ({validation, authentication}) => {
  const navigation = useNavigation();
  const {setCurrentAccount} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const validate = useCallback(
    (fieldname: string, fieldvalue: string) => {
      const validationError = validation?.validate(fieldname, {
        [fieldname]: fieldvalue,
      });
      if (validationError) setError(validationError);
    },
    [validation],
  );

  useEffect(() => {
    if (email) validate('email', email);
  }, [email, validate, validation]);

  useEffect(() => {
    if (password) validate('password', password);
  }, [password, validate, validation]);

  async function onSubmit() {
    if (loading) return;
    try {
      setLoading(true);
      const account = await authentication.auth({email, password});
      setCurrentAccount(account as AccountModel);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  function onLinkBurttonPress() {
    navigation.navigate('Register' as any);
  }

  return (
    <Container testID="login-container">
      <Spinner visible={loading} />
      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        marginBottom={16}
        testID="email-input"
      />
      <Input
        value={password}
        onChangeText={setPassword}
        placeholder="Senha"
        testID="password-input"
      />
      <Button
        title="Entrar"
        testID="submit"
        marginTop={16}
        disabled={!password || !email}
        onPress={onSubmit}
      />
      <LinkButton testID="register-button" onPress={onLinkBurttonPress}>
        Criar conta
      </LinkButton>
      <ErrorMessage error={error} />
    </Container>
  );
};
