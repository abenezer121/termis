import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { useEffect, useRef } from 'react';
import { useXTerm } from 'react-xtermjs';

const XtermTerminal = () => {
  const { instance, ref } = useXTerm();
  const fitAddon = new FitAddon();
  const webLinksAddon = new WebLinksAddon();
  const wsRef = useRef(null);
  const currentLineRef = useRef('');


  const credentials = {
    host: '9.141.19.175',
    username: 'azureadmin',
    privateKey: '/home/abenezer121/Downloads/sshkeys/gebeta_key_prod_1.pem',
    port: 22
  };

  useEffect(() => {
    if (!instance) return;

    instance.loadAddon(fitAddon);
    instance.loadAddon(webLinksAddon);
    fitAddon.fit();

    wsRef.current = new WebSocket('ws://localhost:8080');

    wsRef.current.onmessage = (event) => {
      instance.write(event.data);
    };

    wsRef.current.onopen = () => {
      instance.writeln('Connecting to SSH server...');
      wsRef.current.send(JSON.stringify({
        type: 'connect',
        ...credentials
      }));
    };

    wsRef.current.onerror = (error) => {
      instance.writeln(`\r\nWebSocket Error: ${error.message}\r\n`);
    };

    wsRef.current.onclose = () => {
      instance.writeln('\r\nDisconnected from SSH server\r\n');
    };

    instance.onKey(({ key, domEvent }) => {
      // Handle special key combinations
      if (domEvent.ctrlKey) {
        switch (key) {
          case 'c':
            // Ctrl+C - SIGINT (0x03)
            wsRef.current.send(JSON.stringify({
              type: 'command',
              command: '\x03'
            }));
            instance.write('^C');
            currentLineRef.current = '';
            break;
          
          case 'z':
            // Ctrl+Z - SIGTSTP (0x1A)
            wsRef.current.send(JSON.stringify({
              type: 'command',
              command: '\x1A'
            }));
            instance.write('^Z');
            currentLineRef.current = '';
            break;
          
          case 'd':
            // Ctrl+D - EOF (0x04)
            wsRef.current.send(JSON.stringify({
              type: 'command',
              command: '\x04'
            }));
            instance.write('^D');
            currentLineRef.current = '';
            break;
          
          case 'l':
            // Ctrl+L - Clear screen
            instance.clear();
            break;
          
          default:
            // Send other Ctrl+key combinations as control characters
            const charCode = key.charCodeAt(0);
            if (charCode >= 97 && charCode <= 122) { // a-z
              const controlChar = String.fromCharCode(charCode - 96);
              wsRef.current.send(JSON.stringify({
                type: 'command',
                command: controlChar
              }));
            }
        }
      } else {
        // Handle normal keys
        switch (key) {
          case '\r': // Enter
            wsRef.current.send(JSON.stringify({
              type: 'command',
              command: currentLineRef.current + '\n'
            }));
            currentLineRef.current = '';
            instance.write('\r\n');
            break;
          
          case '\x7f': // Backspace
            if (currentLineRef.current.length > 0) {
              currentLineRef.current = currentLineRef.current.slice(0, -1);
              instance.write('\b \b');
            }
            break;
          
          case '\x1b': // Escape
           
            break;
          
          default:
            if (key.length === 1 && key.charCodeAt(0) >= 32) {
              currentLineRef.current += key;
              instance.write(key);
            }
        }
      }
    });

    const handleResize = () => {
      fitAddon.fit();
      // Send terminal resize information to server if needed
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const { cols, rows } = instance;
        wsRef.current.send(JSON.stringify({
          type: 'resize',
          cols,
          rows
        }));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [instance]);

  return <div ref={ref} style={{ height: '100%', width: '100%' }} />;
};

export default XtermTerminal;