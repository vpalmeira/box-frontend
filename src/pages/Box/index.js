import React, { Component } from 'react';

import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Dropzone from 'react-dropzone';
import socket from 'socket.io-client';

import api from '../../services/api';

import { MdInsertDriveFile } from 'react-icons/md';
import logo from '../../assets/logo.svg';
import './styles.css';

class Box extends Component {

  state = {
    box: {}
  }

  async componentDidMount() {
    this.subscribeToNewFiles();

    const boxId = this.props.match.params.id;
    const response = await api.get(`box/${boxId}`);

    this.setState({ box: response.data });
  }

  // render new files saved on backend
  subscribeToNewFiles = () => {
    const url = api.defaults.baseURL;
    const boxId = this.props.match.params.id;
    const io = socket(url);

    io.emit('connectRoom', boxId);

    io.on('file', data => {
      this.setState({
        box: {
          ...this.state.box,
          files: [data, ...this.state.box.files]
        }
      })
    });
  }

  handleUpload = (files) => {
    const boxId = this.state.box._id;

    files.forEach( file => {
      const data = new FormData();

      data.append('file', file);

      api.post(`box/${boxId}/file`, data);
      }
    );
  }

  render() {
    return (
      <div id='box-container'>
        <header>
          <img src={logo} alt=''/>
          <h1>{ this.state.box.title }</h1>
        </header>

        <Dropzone onDropAccepted={ this.handleUpload }>
          { ({ getRootProps, getInputProps }) => (
            <div className='upload' {...getRootProps()} >
              <input {...getInputProps()} />
              <p>Arraste os arquivos ou clique aqui</p>
            </div>
          )}
        </Dropzone>

        <ul>
          { this.state.box.files &&
            this.state.box.files.map( file => (
              <li key={ file._id }>
                <a
                  className='fileInfo'
                  href={ file.url }
                  target='_blank'
                  rel='noopener noreferrer'
                  >
                  <MdInsertDriveFile size={24} color='#A5Cfff'/>
                  <strong>{ file.title }</strong>
                </a>
                <span>há{' '}
                  { distanceInWords(file.createdAt, new Date(), {locale: pt}) }
                </span>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}

export default Box;
