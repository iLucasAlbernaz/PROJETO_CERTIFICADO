import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CloseButton, Container, Form, Modal, Spinner } from 'react-bootstrap';
import { FiType, FiSearch, FiAward, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import type { Certificate } from '../types';
import { formatDate, maskCPF, onlyDigits } from '../utils/format';

const lookupSchema = z.object({
  cpf: z
    .string()
    .min(14, 'Informe um CPF válido')
    .max(14, 'Informe um CPF válido')
});

type LookupForm = z.infer<typeof lookupSchema>;

export const PublicLookup = () => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LookupForm>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { cpf: '' }
  });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const onSubmit = async ({ cpf }: LookupForm) => {
    const digits = onlyDigits(cpf);
    setIsLoading(true);
    try {
      const { data } = await api.get<Certificate[]>(`/certificates/lookup/${digits}`);
      setCertificates(data);
      setShowModal(true);
    } catch {
      toast.error('Nenhum certificado encontrado para o CPF informado.');
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      title: 'Informe o CPF',
      description: 'Digite o CPF do aluno e inicie a busca instantânea.',
      icon: <FiType size={28} />
    },
    {
      title: 'Confira os dados',
      description: 'Veja registro, curso e período diretamente no resultado.',
      icon: <FiSearch size={28} />
    },
    {
      title: 'Valide o certificado',
      description: 'Use a credencial digital para confirmar a autenticidade.',
      icon: <FiAward size={28} />
    }
  ];

  return (
    <>
      <section className="hero-clean">
        <Container className="hero-inner">
          <div className="hero-text">
            <p className="eyebrow">Portal de consulta</p>
            <h1>Validador de Certificados</h1>
            <span className="underline" />
            <p className="lead">
              Confira em segundos se um certificado foi emitido oficialmente pela Faculdade Guerra.
            </p>
          </div>
          <Card className="hero-card">
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Label className="mb-2">Digite o CPF</Form.Label>
                <div className="search-bar">
                  <Controller
                    control={control}
                    name="cpf"
                    render={({ field }) => (
                      <Form.Control
                        {...field}
                        type="text"
                        placeholder="000.000.000-00"
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(maskCPF(event.target.value))}
                        isInvalid={!!errors.cpf}
                      />
                    )}
                  />
                  <Button type="submit" className="search-button" disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Consultar'}
                  </Button>
                </div>
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors.cpf?.message}
                </Form.Control.Feedback>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </section>

      <section className="how-it-works">
        <Container>
          <div className="steps-grid">
            {steps.map((step) => (
              <Card key={step.title} className="step-card">
                <Card.Body>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Faculdade Guerra. Todos os direitos reservados.</p>
        <a href="/admin/login">Acesso administrativo</a>
      </footer>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="credential-modal">
        <Modal.Header>
          <div>
            <p className="text-uppercase text-muted small mb-1">Resultado da consulta</p>
            <h5 className="mb-0">Credenciais encontradas</h5>
          </div>
          <CloseButton onClick={() => setShowModal(false)} />
        </Modal.Header>
        <Modal.Body>
          <div className="credential-stack">
            {certificates.map((item) => (
              <div key={item.id ?? `${item.cpf}-${item.registro}`} className="credential-card animate">
                <div className="credential-status">✅ Certificado válido</div>
                <div className="credential-header">
                  <div>
                    <span className="label">Curso</span>
                    <h4>{item.curso}</h4>
                  </div>
                  <div className="seal">
                    <FiShield size={24} />
                    <span>Autenticado</span>
                  </div>
                </div>
                <div className="credential-grid">
                  <div>
                    <span className="label">Aluno</span>
                    <p>{item.nome}</p>
                  </div>
                  <div>
                    <span className="label">CPF</span>
                    <p>{item.cpf}</p>
                  </div>
                  <div>
                    <span className="label">Início</span>
                    <p>{formatDate(item.inicio)}</p>
                  </div>
                  <div>
                    <span className="label">Término</span>
                    <p>{formatDate(item.fim)}</p>
                  </div>
                  <div>
                    <span className="label">Registro</span>
                    <p>{item.registro}</p>
                  </div>
                  <div>
                    <span className="label">Matrícula</span>
                    <p>{item.matricula}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};
