/**
 * Texto do aviso de monitoramento no MODO DEMO: cópia literal do
 * `MOCK_MONITORING_NOTICE` de `baluarte-frontend/src/mocks/data.ts` (que o backend
 * confere contra o texto servido). No modo API o texto vem SEMPRE do
 * GET /monitoramento/aviso, nunca daqui.
 */
import type { MonitoringNotice } from '../types';

export const MOCK_MONITORING_NOTICE: Omit<MonitoringNotice, 'acknowledged'> = {
  version: '2026-10-19',
  title: 'Aviso de Monitoramento das Estações de Trabalho e Tratamento de Dados',
  intro:
    'Este aviso descreve o monitoramento técnico das estações de trabalho pela plataforma Baluarte e o tratamento dos dados coletados. O reconhecimento deste aviso é condição para a utilização da plataforma: enquanto a ciência não for registrada, o acesso aos recursos do sistema permanece bloqueado.',
  sections: [
    {
      id: 'sobre',
      title: '1. Sobre o monitoramento',
      paragraphs: [
        'O Baluarte é uma plataforma de cibersegurança utilizada para identificar vulnerabilidades, acompanhar riscos tecnológicos e contribuir para a proteção dos sistemas e das informações da organização.',
        'Para auxiliar nessa proteção, a empresa poderá utilizar um agente de monitoramento técnico denominado osquery, instalado nas estações de trabalho corporativas. Esse agente realiza verificações periódicas e encaminha ao Baluarte informações técnicas sobre os equipamentos monitorados.',
        'O monitoramento tem finalidade preventiva e busca identificar programas desatualizados, possíveis falhas de segurança, serviços de rede expostos e outras condições que possam representar riscos ao ambiente tecnológico da organização.',
        'Este aviso apresenta, de maneira clara e transparente, quais informações são coletadas, como são utilizadas, quem poderá acessá-las e quais são os direitos dos colaboradores em relação ao tratamento de seus dados.',
      ],
      items: [],
      notes: [],
    },
    {
      id: 'coletado',
      title: '2. Quais informações são coletadas?',
      paragraphs: [
        'O agente realiza coletas técnicas periódicas, limitadas às informações necessárias para a identificação e o acompanhamento de riscos de segurança.',
        'As informações coletadas incluem:',
      ],
      items: [
        'Programas instalados: nome, versão e a identificação de origem de cada software — o fornecedor, o mantenedor do pacote ou o identificador do aplicativo, conforme o sistema operacional do equipamento. Em sistemas baseados em Debian, também é coletado o pacote de origem (nome e, quando diferente, versão). A coleta ocorre a cada 1 hora.',
        'Sistema operacional: nome, versão, número de compilação (build) e plataforma do sistema operacional utilizado. A verificação ocorre a cada 6 horas.',
        'Portas de rede: as portas abertas, o protocolo e o endereço de escuta, e o nome do processo associado a cada uma — apenas o nome do processo, sem o caminho do arquivo nem a linha de comando —, permitindo identificar serviços potencialmente expostos. A verificação ocorre a cada 15 minutos.',
        'Identificação do equipamento: nome da estação de trabalho e identificador técnico utilizado para distinguir o dispositivo dentro da plataforma.',
        'Informações de comunicação: data e horário do último contato realizado entre o agente e o Baluarte, utilizados para acompanhar a conectividade do equipamento.',
      ],
      notes: [
        'Esses dados compõem um inventário técnico de segurança e permitem que a equipe responsável identifique situações que possam exigir atualização, correção ou investigação.',
        'As frequências indicadas são as aplicadas no ambiente de produção e podem variar ligeiramente (em até cerca de 10%) por motivos técnicos de distribuição da coleta.',
      ],
    },
    {
      id: 'nao-coletado',
      title: '3. Quais informações NÃO são coletadas?',
      paragraphs: [
        'O monitoramento descrito neste aviso não tem como objetivo acompanhar atividades pessoais, avaliar produtividade ou fiscalizar o comportamento individual dos colaboradores.',
        'O agente, na configuração prevista para o Baluarte, não realiza a leitura, captura ou transmissão de:',
      ],
      items: [
        'Arquivos pessoais ou documentos armazenados no computador;',
        'Conteúdo de e-mails ou mensagens particulares;',
        'Histórico de navegação na internet;',
        'Senhas ou informações digitadas no teclado;',
        'Capturas de tela, imagens ou gravações da atividade do usuário;',
        'Dados de localização geográfica do colaborador.',
      ],
      notes: [
        'O módulo de análise de arquivos disponível no portal Baluarte funciona de maneira independente. Nesse recurso, a análise ocorre somente quando o próprio usuário seleciona e envia um arquivo à plataforma.',
        'O monitoramento técnico também não autoriza, por si só, o acesso ao conteúdo de informações particulares eventualmente armazenadas no equipamento.',
      ],
    },
    {
      id: 'finalidade',
      title: '4. Para quais finalidades os dados são utilizados?',
      paragraphs: [
        'As informações coletadas são utilizadas exclusivamente para finalidades relacionadas à segurança da informação e à proteção do ambiente tecnológico da organização.',
        'Entre essas finalidades estão a identificação de softwares com vulnerabilidades conhecidas, a detecção de serviços de rede potencialmente expostos, o acompanhamento das condições de segurança dos equipamentos e o apoio à definição de medidas preventivas e corretivas.',
        'O Baluarte permite relacionar as informações do inventário técnico a referências públicas de vulnerabilidades, auxiliando a equipe de segurança na identificação de riscos e na priorização das correções necessárias.',
        'As informações coletadas não se destinam à avaliação de desempenho profissional, ao controle de produtividade ou à análise de atividades pessoais dos colaboradores.',
      ],
      items: [],
      notes: [],
    },
    {
      id: 'acesso',
      title: '5. Quem pode acessar as informações?',
      paragraphs: [
        'O acesso ao inventário técnico das estações de trabalho é restrito aos usuários autorizados, conforme os perfis de acesso definidos na plataforma Baluarte.',
        'O Administrador possui acesso às informações de monitoramento e aos recursos necessários à administração da plataforma.',
        'O Analista pode consultar os inventários, acompanhar vulnerabilidades e executar as atividades de análise de segurança previstas para seu perfil.',
        'O Colaborador não possui permissão para consultar os inventários técnicos das estações de trabalho.',
        'Essas restrições são aplicadas por mecanismos de controle de acesso baseados em funções (RBAC), com o objetivo de impedir o acesso a recursos incompatíveis com as permissões atribuídas a cada usuário.',
        'O tratamento das informações deve observar os princípios da necessidade, finalidade, segurança e prevenção previstos na legislação de proteção de dados pessoais.',
      ],
      items: [],
      notes: [],
    },
    {
      id: 'retencao',
      title: '6. Armazenamento e conservação das informações',
      paragraphs: [
        'O Baluarte mantém o inventário técnico mais recente de cada estação monitorada. A cada nova coleta, as informações correspondentes são atualizadas, substituindo os dados anteriores do inventário.',
        'As vulnerabilidades identificadas a partir dessas informações geram registros de segurança, denominados achados, que são conservados para acompanhamento e histórico. Quando tratados, os achados passam a constar como resolvidos ou como risco aceito; eles não são excluídos automaticamente pela plataforma.',
        'Os registros de ciência deste aviso são tratados separadamente do inventário técnico, para permitir a comprovação de que o colaborador recebeu as informações relativas ao monitoramento.',
        'Os dados deverão ser conservados somente pelo período necessário às finalidades informadas e às obrigações legais aplicáveis, observados os critérios de retenção da organização.',
      ],
      items: [],
      notes: [],
    },
    {
      id: 'base-legal',
      title: '7. Proteção dos dados e conformidade com a LGPD',
      paragraphs: [
        'O tratamento de dados pessoais relacionado ao monitoramento das estações de trabalho deverá observar a Lei nº 13.709/2018, conhecida como Lei Geral de Proteção de Dados Pessoais (LGPD).',
        'Quando devidamente demonstrados os requisitos legais, esse tratamento poderá fundamentar-se no legítimo interesse da organização em proteger seus sistemas, equipamentos, informações e infraestrutura tecnológica, conforme o artigo 7º, inciso IX, e o artigo 10 da LGPD.',
        'A utilização dessa hipótese legal pressupõe a avaliação da necessidade e da proporcionalidade do tratamento, considerando também os direitos, as liberdades fundamentais e as legítimas expectativas dos titulares dos dados.',
        'A organização deverá adotar medidas técnicas e administrativas adequadas à proteção das informações tratadas, em conformidade com o artigo 46 da LGPD.',
      ],
      items: [],
      notes: [],
    },
    {
      id: 'direitos',
      title: '8. Direitos dos colaboradores',
      paragraphs: [
        'Os colaboradores possuem os direitos previstos na LGPD, observados os requisitos e as condições estabelecidos na legislação.',
        'Entre esses direitos estão solicitar informações sobre o tratamento de seus dados pessoais, requerer a correção de dados incompletos ou inexatos, obter esclarecimentos sobre as finalidades do tratamento e apresentar oposição quando cabível.',
        'Dúvidas, solicitações ou questionamentos relacionados ao monitoramento poderão ser encaminhados à equipe responsável pela segurança da informação ou ao encarregado pelo tratamento de dados pessoais da organização, por meio dos canais oficiais disponibilizados pela empresa.',
      ],
      items: [],
      notes: [],
    },
    {
      id: 'ciencia',
      title: '9. Registro de ciência',
      paragraphs: [
        'Ao selecionar a opção "Li e estou ciente", o colaborador declara ter recebido e tomado conhecimento das informações apresentadas neste aviso, incluindo as finalidades do monitoramento, os tipos de dados coletados, a frequência das verificações e as condições de utilização das informações.',
        'O reconhecimento deste aviso é condição para a utilização da plataforma Baluarte: enquanto a ciência não for registrada, o acesso aos recursos do sistema permanece bloqueado. Esse bloqueio tem por objetivo assegurar que o colaborador tenha tomado conhecimento do monitoramento antes de utilizar a plataforma e não constitui pedido de consentimento para o tratamento de dados pessoais.',
        'O registro de ciência não constitui solicitação de consentimento para o tratamento de dados pessoais, nem representa renúncia aos direitos assegurados pela LGPD. Sua finalidade é documentar que as informações relativas ao monitoramento foram disponibilizadas ao colaborador.',
        'Para fins de rastreabilidade e transparência, o Baluarte registra a identificação do usuário que confirmou a ciência, a data e o horário da confirmação e a versão do aviso apresentada naquele momento.',
        'Caso este aviso seja atualizado, uma nova confirmação de ciência será solicitada para assegurar que os colaboradores tomem conhecimento das alterações realizadas.',
        'O registro de ciência não substitui as responsabilidades legais da organização quanto à proteção dos dados pessoais e à utilização adequada das informações coletadas.',
      ],
      items: [],
      notes: [],
    },
  ],
};
