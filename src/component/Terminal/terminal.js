import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
const { ipcRenderer } = window.require("electron");

const XtermTerminal = (props) => {
  const terminalRef = useRef(null);
  const terminalInstance = useRef(null);
  const fitAddonInstance = useRef(null);
  const currentLineRef = useRef("");
  const isConnected = useRef(false);
  const connectionAttempted = useRef(false);
  const [showConnecting, setShowConnecting] = useState(true);

  const privateKey = props.id;

  useEffect(() => {
    if (terminalRef.current && !terminalInstance.current) {
      terminalInstance.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#000",
          foreground: "#fff",
        },
        convertEol: true,
      });

      fitAddonInstance.current = new FitAddon();
      terminalInstance.current.loadAddon(fitAddonInstance.current);
      terminalInstance.current.open(terminalRef.current);

      setTimeout(() => {
        fitAddonInstance.current.fit();
      }, 0);

      terminalInstance.current.onKey(({ key, domEvent }) => {
        if (domEvent.ctrlKey) {
          switch (key) {
            case "c":
              ipcRenderer.invoke("ssh-command", {
                sshId: privateKey,
                command: "\x03", // Ctrl+C
              });
              terminalInstance.current.write("^C\r\n");
              currentLineRef.current = "";
              break;
            case "z":
              ipcRenderer.invoke("ssh-command", {
                sshId: privateKey,
                command: "\x1A", // Ctrl+Z
              });
              terminalInstance.current.write("^Z\r\n");
              currentLineRef.current = "";
              break;
            case "d":
              ipcRenderer.invoke("ssh-command", {
                sshId: privateKey,
                command: "\x04", // Ctrl+D
              });
              terminalInstance.current.write("^D\r\n");
              currentLineRef.current = "";
              break;
            case "l":
              terminalInstance.current.clear();
              break;
            default:
              const charCode = key.charCodeAt(0);
              if (charCode >= 97 && charCode <= 122) {
                const controlChar = String.fromCharCode(charCode - 96);
                ipcRenderer.invoke("ssh-command", {
                  sshId: privateKey,
                  command: controlChar,
                });
              }
          }
        } else {
          switch (key) {
            case "\r": // Enter key
              ipcRenderer.invoke("ssh-command", {
                sshId: privateKey,
                command: currentLineRef.current + "\n",
              });
              terminalInstance.current.write("\r\n");
              currentLineRef.current = "";
              break;
            case "\x7f": // Backspace
              if (currentLineRef.current.length > 0) {
                currentLineRef.current = currentLineRef.current.slice(0, -1);
                terminalInstance.current.write("\b \b");
              }
              break;
            case "\x1b": // Escape
              break;
            default:
              if (key.length === 1 && key.charCodeAt(0) >= 32) {
                currentLineRef.current += key;
                terminalInstance.current.write(key);
              }
          }
        }
      });
    }

    const handleSshData = (_event, { sshId, data }) => {
      if (sshId === privateKey && terminalInstance.current) {
        terminalInstance.current.write(data);
      }
    };

    const handleSshError = (_event, { message }) => {
      if (terminalInstance.current) {
        terminalInstance.current.write(`\r\nError: ${message}\r\n`);
        isConnected.current = false;
        setShowConnecting(true);
      }
    };

    ipcRenderer.on("ssh-data", handleSshData);
    ipcRenderer.on("ssh-error", handleSshError);

    return () => {
      ipcRenderer.removeListener("ssh-data", handleSshData);
      ipcRenderer.removeListener("ssh-error", handleSshError);
      if (terminalInstance.current) {
        terminalInstance.current.dispose();
        terminalInstance.current = null;
      }
    };
  }, [privateKey]);

  useEffect(() => {
    const resizeTerminal = () => {
      if (fitAddonInstance.current && terminalInstance.current) {
        fitAddonInstance.current.fit();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resizeTerminal();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", resizeTerminal);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", resizeTerminal);
    };
  }, []);

  const handleConnect = async () => {
    try {
      if (terminalInstance.current) {
        setShowConnecting(true);
        const response = await ipcRenderer.invoke("ssh-connect", {
          host: props.host,
          id: privateKey,
          port: 22,
          username: props.username,
          privateKey: props.privateKey,
          cols: terminalInstance.current.cols,
          rows: terminalInstance.current.rows,
        });

        isConnected.current = true;
        setShowConnecting(false);
        terminalInstance.current.focus();
      }
    } catch (error) {
      console.error("Failed to connect to SSH:", error);
      if (terminalInstance.current) {
        terminalInstance.current.write(
          `\r\nFailed to connect to SSH: ${error.message}\r\n`,
        );
      }
      isConnected.current = false;
      setShowConnecting(true);
    }
  };

  useEffect(() => {
    if (!connectionAttempted.current && !isConnected.current) {
      connectionAttempted.current = true;
      handleConnect();
    }
  }, []);

  return (
    <div className="flex flex-col h-[90%] w-full relative">
      <div
        ref={terminalRef}
        className="flex-1 bg-black overflow-auto pb-5"
        onClick={() => terminalInstance.current?.focus()}
      />

      {showConnecting && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-white text-lg">Connecting...</div>
        </div>
      )}
    </div>
  );
};

export default XtermTerminal;
