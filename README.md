# Quem é Quem — WorldSkills Brasil

Diretório navegável dos participantes da competição nacional WorldSkills Brasil / SENAI, reconstruído como uma página HTML autocontida.

## O que é

Este projeto reorganiza os dados públicos do "Quem é Quem" da WorldSkills Brasil em uma página HTML independente, mais rápida e com mais recursos de navegação do que o painel original.

**[Abrir a página](quem-e-quem.html)**

### Recursos

- Busca instantânea por nome, instituição ou ocupação
- Filtros combináveis por perfil, instituição, ocupação e local de competição
- Agrupamento por categoria (Competidores, Avaliação, Liderança técnica, Organização, Comunicação)
- Visão em grade (com retrato) ou em lista
- Painel de detalhe por pessoa
- Gráficos de distribuição clicáveis (ocupações, instituições, locais)
- Exportação do recorte atual para CSV
- Tema claro/escuro automático
- Funciona 100% offline: dados e fotos ficam embutidos no próprio arquivo HTML — não depende de nenhum serviço externo além das fontes tipográficas

### Dados

- **943** participantes únicos
- **904** com retrato
- **48** ocupações
- **28** instituições

Os únicos campos exibidos são os que já apareciam no painel público original (nome, instituição, perfil, ocupação, local, delegação, empresa e foto). Outros campos presentes na fonte de dados mas nunca exibidos publicamente (dados de contato e documentos pessoais) não foram extraídos.

As fotos usadas na página são versões otimizadas (240×320) das fotos de credenciamento originais (nativamente 600×800), para manter o arquivo HTML em um tamanho razoável. Os arquivos em resolução máxima não estão neste repositório por tamanho (mais de 150 MB) e foram distribuídos separadamente.

## Estrutura do projeto

```
quem-e-quem.html        → página final, pronta para abrir em qualquer navegador
page.template.html      → template-fonte da página (HTML/CSS/JS), com um marcador
                           onde os dados são injetados na hora do build
data/pessoas.json       → dados já limpos e deduplicados

fetch.mjs               → coleta os registros de origem
build-data.mjs          → (auxiliar) normaliza os dados em formato compacto
fotos_raw.py            → baixa as fotos de credenciamento em resolução original
fotos_hq.py             → recorta/redimensiona as fotos para uso na página
build-bundle.py         → monta o bundle final (dados + fotos em base64)
pack_originals.py       → empacota as fotos originais em um único .zip
pack_originals_split.py → mesma coisa, mas dividida em partes menores
```

## Como reconstruir do zero

Pré-requisitos: Node.js 18+, Python 3.10+ com Pillow (`pip install Pillow`).

```bash
node fetch.mjs               # 1. coleta os dados de origem
python fotos_raw.py          # 2. baixa as fotos em resolução original
python fotos_hq.py           # 3. gera as miniaturas usadas na página
python build-bundle.py       # 4. monta o bundle de dados (JSON + fotos em base64)
```

Depois, injete o bundle no template para gerar o HTML final:

```bash
python -c "
tpl = open('page.template.html', encoding='utf8').read()
data = open('data/bundle.json', encoding='utf8').read()
open('quem-e-quem.html', 'w', encoding='utf8').write(tpl.replace('/*__DATA__*/', data))
"
```

## Licença

Uso pessoal / educacional. Os dados pertencem à WorldSkills Brasil e ao SENAI; este projeto apenas os reorganiza em um formato mais acessível.
