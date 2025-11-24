import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha obrigatória')
});

type LoginForm = z.infer<typeof loginSchema>;

export const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (payload: LoginForm) => {
    setIsLoading(true);
    try {
      await login(payload);
      toast.success('Bem-vindo!');
      const redirect = (location.state as { from?: Location })?.from?.pathname ?? '/admin';
      navigate(redirect, { replace: true });
    } catch {
      toast.error('Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <Card className="login-card">
        <Card.Body>
          <div className="login-header">
            <p className="text-uppercase text-danger fw-semibold mb-1">Painel administrativo</p>
            <h1 className="login-title">Acessar painel</h1>
            <p className="login-subtitle">Use suas credenciais para gerenciar os certificados da Faculdade Guerra.</p>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="login-field">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="E-mail"
                {...register('email')}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </div>
            <div className="login-field">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="•••••••"
                autoComplete="current-password"
                {...register('password')}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </div>
            <Button type="submit" className="primary-action w-100" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};
