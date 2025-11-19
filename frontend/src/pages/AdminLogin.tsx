import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Container, Form } from 'react-bootstrap';
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
    <Container className="py-5" style={{ maxWidth: 420 }}>
      <Card className="shadow border-0">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <p className="text-danger text-uppercase fw-semibold mb-1">Painel Administrativo</p>
            <h1 className="h4">Acessar painel</h1>
            <p className="text-muted mb-0">Use suas credenciais para gerenciar certificados.</p>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)} className="d-grid gap-3">
            <div>
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="admin@certificados.com"
                {...register('email')}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </div>
            <div>
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="******"
                autoComplete="current-password"
                {...register('password')}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </div>
            <Button type="submit" className="mt-2" variant="danger" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};
