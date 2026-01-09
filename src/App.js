import React, { useState } from 'react';

// --- Ícones (Pequenos e fixos) ---
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

function App() {
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => setFileContent(e.target.result);
      reader.readAsText(file);
    }
  };

  const searchKeywords = () => {
    if (!fileContent || !keywords.trim()) return alert("Carregue um arquivo e digite palavras-chave!");
    setLoading(true);
    setTimeout(() => {
      const keywordList = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      const lines = fileContent.split('\n');
      const newResults = [];

      keywordList.forEach(key => {
        const found = lines.map((text, idx) => ({ text, idx: idx + 1 }))
                           .filter(item => item.text.toLowerCase().includes(key));
        if (found.length > 0) newResults.push({ keyword: key, lines: found });
      });

      setResults(newResults);
      setSearched(true);
      setLoading(false);
    }, 800);
  };

  const highlightText = (text, keyword) => {
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) => part.toLowerCase() === keyword ? <span key={i} className="highlight">{part}</span> : part);
  };

  const downloadReport = () => {
    let content = `RELATÓRIO FORENSE - ${fileName}\nData: ${new Date().toLocaleString()}\n\n`;
    results.forEach(res => {
      content += `PALAVRA-CHAVE: "${res.keyword}" (${res.lines.length} ocorrências)\n`;
      content += `--------------------------------------------------\n`;
      res.lines.forEach(l => content += `[Linha ${l.idx}] ${l.text}\n`);
      content += `\n`;
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], {type: 'text/plain'}));
    link.download = `Relatorio_${Date.now()}.txt`;
    link.click();
  };

  return (
    // IMPORTANTE: translate="no" impede que o Google Tradutor quebre o site
    <div className="hacker-container" translate="no">
      
      {/* Cabeçalho */}
      <div className="header">
        <div className="title-group">
          <div style={{border: '1px solid #00ff41', padding: '10px', borderRadius: '5px'}}><SearchIcon /></div>
          <div>
            <h1 className="title">Extrator J.CF</h1>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px'}}>
              <div className="status-dot"></div> <span style={{fontSize: '12px', color: '#888'}}>SISTEMA ONLINE v3.1</span>
            </div>
          </div>
        </div>
        {fileContent && <button onClick={() => window.location.reload()} className="btn-small"><TrashIcon /> RESET</button>}
      </div>

      {/* Upload */}
      <div className="upload-area">
        <label style={{cursor: 'pointer', display: 'block'}}>
          <input type="file" hidden accept=".txt" onChange={handleFileUpload} />
          <UploadIcon />
          {/* O 'key' força o React a recriar o texto do zero se o nome mudar, evitando erros */}
          <p key={fileName} style={{margin: '10px 0', fontWeight: 'bold'}}>
            {fileName ? `ARQUIVO CARREGADO: ${fileName}` : "CLIQUE PARA INJETAR ARQUIVO ALVO (.TXT)"}
          </p>
        </label>
      </div>

      {/* Busca */}
      <div className="search-area">
        <input 
          className="search-input" 
          placeholder="Digite palavras-chave separadas por vírgula (ex: senha, admin)..." 
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
      </div>

      <button className="btn-action" onClick={searchKeywords} disabled={loading}>
        {loading ? "PROCESSANDO DADOS..." : <><SearchIcon /> INICIAR EXTRAÇÃO</>}
      </button>

      {/* Resultados */}
      {searched && (
        <div style={{marginTop: '30px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <h2>RESULTADOS ENCONTRADOS</h2>
            {results.length > 0 && <button onClick={downloadReport} className="btn-small"><DownloadIcon /> BAIXAR RELATÓRIO</button>}
          </div>

          {results.length === 0 ? (
            <div style={{textAlign: 'center', padding: '20px', color: 'orange', border: '1px dashed orange'}}>NENHUM DADO ENCONTRADO</div>
          ) : (
            results.map((res, i) => (
              <div key={i} className="result-card">
                <div className="result-header">
                  <strong>CHAVE: "{res.keyword.toUpperCase()}"</strong>
                  <span className="badge">{res.lines.length} MATCHES</span>
                </div>
                <div className="result-body">
                  {res.lines.map((l, idx) => (
                    <div key={idx} className="line-item">
                      <span style={{color: '#555', marginRight: '10px'}}>L:{l.idx}</span>
                      {highlightText(l.text, res.keyword)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App; 
