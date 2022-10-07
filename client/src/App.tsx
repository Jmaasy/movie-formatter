import React from 'react' 
import { LobbyView } from './component/lobby/LobbyView';
import './App.css';

export const App: React.FC = _ => {  
    return (
        <div id="main">
            <LobbyView></LobbyView>
        </div>
    );
}