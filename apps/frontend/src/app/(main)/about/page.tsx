'use client';

import React from 'react';
import { User, CheckCircle, Target, Square } from 'lucide-react';

export default function About() {
  return (
    <main className='flex flex-col p-8'>
      <h1 className='mb-8 text-4xl font-bold text-gray-800 dark:text-gray-200'>
        Sobre o Projeto
      </h1>

      {/* Hero Section with a static image */}
      {/* <section className='relative mb-8'>
        <img
          src='/assets/img/hero-image.jpg'
          alt='Imagem ilustrativa do projeto'
          className='h-96 w-full rounded-lg object-cover shadow-lg'
        />
      </section> */}

      {/* Idealizador Section */}
      <section className='mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-700'>
        <div className='mb-4 flex items-center'>
          <User className='text-sisman-blue dark:text-sisman-green mr-2 h-6 w-6' />
          <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300'>
            Idealizador
          </h2>
        </div>
        <div className='flex flex-col items-center md:flex-row md:items-start'>
          <img
            src='http://servicosweb.cnpq.br/wspessoa/servletrecuperafoto?tipo=1&id=K4869703Z3'
            alt='Foto do Idealizador'
            className='mb-4 h-36 w-36 rounded-full object-cover shadow-md md:mr-6 md:mb-0'
          />
          <div className='text-center md:text-left'>
            <h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300'>
              Mykael de Sousa Lima
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Mestrando do Programa de Pós-Graduação em Engenharia Civil e
              Ambiental da UFRN
            </p>
            <p className='text-gray-600 dark:text-gray-400'>
              Servidor da equipe de manutenção da UFRN (2020-2023)
            </p>
            <p className='text-gray-600 dark:text-gray-400'>
              Professor do IFPB (Desde 2023)
            </p>
            <a
              href='http://lattes.cnpq.br/5862165900761875'
              target='_blank'
              rel='noopener noreferrer'
              className='text-sisman-blue dark:text-sisman-green hover:underline'
            >
              Acessar Currículo Lattes
            </a>
            <p className='mt-4 text-gray-600 dark:text-gray-400'>
              O pesquisador, atuando como servidor da equipe de manutenção das
              instalações físicas da Universidade Federal do Rio Grande do Norte
              (UFRN) entre 2020 e 2023, vivenciou os desafios cotidianos do
              setor. Essa experiência permitiu identificar dificuldades
              decorrentes da ausência de um Sistema de Gerenciamento de
              Manutenção Computadorizada (CMMS), motivando a proposta do
              presente estudo.
            </p>
          </div>
        </div>
      </section>

      {/* Justificativas Section */}
      <section className='mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-700'>
        <div className='mb-4 flex items-center'>
          <CheckCircle className='text-sisman-blue dark:text-sisman-green mr-2 h-6 w-6' />
          <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300'>
            Justificativas
          </h2>
        </div>
        <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-2'>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              A manutenção da infraestrutura é um desafio global, com falhas
              afetando o bem-estar e o desenvolvimento sustentável.
            </p>
          </div>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              A indústria da construção civil tem alto impacto ambiental, e a
              manutenção adequada prolonga a vida útil das edificações,
              reduzindo a necessidade de novas construções.
            </p>
          </div>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              Há falta de dados de qualidade e metodologia padronizada na
              manutenção de infraestrutura, especialmente em economias menos
              desenvolvidas e em instituições públicas no Brasil.
            </p>
          </div>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              Nas Instituições Federais de Ensino, a gestão da manutenção é
              negligenciada, com predominância de abordagens manuais e ausência
              de sistemas informatizados (CMMS).
            </p>
          </div>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              CMMS disponíveis no mercado não são viáveis para IFES devido à
              falta de interoperabilidade, complexidade do parque edificado,
              normas específicas e modelo comercial de licenças.
            </p>
          </div>
        </div>
      </section>

      {/* Objetivos Section */}
      <section className='mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-700'>
        <div className='mb-4 flex items-center'>
          <Target className='text-sisman-blue dark:text-sisman-green mr-2 h-6 w-6' />
          <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300'>
            Objetivos
          </h2>
        </div>
        <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-2'>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              Compreender a dinâmica das atividades de manutenção em
              instituições federais de ensino, identificando ativos,
              subsistemas, recursos e fluxos de processo.
            </p>
          </div>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              Elaborar um protótipo de software de Gestão de Manutenção
              Computadorizada (CMMS) como MVP para melhorar a gestão da
              manutenção.
            </p>
          </div>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              Aumentar a eficiência setorial, evitando retrabalhos e reduzindo o
              tempo improdutivo.
            </p>
          </div>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              Melhorar os registros de ativos e eventos, subsidiando tomadas de
              decisões e maior previsibilidade das demandas futuras.
            </p>
          </div>
          <div className='flex items-start rounded-md bg-gray-50 p-4 dark:bg-gray-600'>
            <Square className='text-sisman-blue dark:text-sisman-green mt-1 mr-3 h-5 w-5 flex-shrink-0' />
            <p className='text-gray-700 dark:text-gray-300'>
              Colaborar efetivamente com o processo de melhoria na manutenção da
              infraestrutura das organizações, fornecendo dados sistemáticos e
              estruturados.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
