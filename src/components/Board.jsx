import React from 'react';
import Reflux from 'reflux';

import Actions from '../Actions/Actions';
import Store from '../Stores/Store';

import Field from './Field';
import Loading from './Loading';
import Header from './Header';
import Button from './Button';

export default React.createClass({

  displayName: 'Board',

  mixins: [Reflux.connect(Store)],

  componentWillMount() {
    Actions.fetchBoard();
    Actions.enableBoardPoll();
    Actions.enablePlayersPoll();
  },

  componentWillUpdate(nextProps, nextState) {
    if (nextState.currentPlayer && !this.state.currentPlayer) {
      Actions.connectPlayer(nextState.currentPlayer.id);
    }
  },

  getStyles() {
    return {
      board: {
        border: '1px solid #777',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 312,
        margin: '0px auto'
      },
      button: {
        padding: '50px 0 20px 0',
        display: 'flex',
        justifyContent: 'center'
      },
      header: {
        paddingBottom: 20
      }
    };
  },

  handleClearBoard() {
    let dataObjectsIds = this.state.items.map((dataObject) => dataObject.id);
    let playersIds = this.state.players.map((player) => player.id);

    Actions.clearBoard(dataObjectsIds);
    Actions.clearWinner(playersIds);
  },

  handleFieldClick(dataObjectId, index) {
    let state = this.state;
    let value = state.turn;

    if (state.items[index].value === null) {
      state.items[index].value = value;
      this.setState(state, () => {
      });
      Actions.updateField(dataObjectId, value);
      Actions.switchTurn(state.currentPlayer.id, state.opponent.id);
    }
  },

  renderFields() {
    let state = this.state;
    let fields = state.items.map((item, index) => {
      let isDisabled = !state.isPlayerTurn ||
        state.isGameOver ||
        item.value ||
        (state.opponent && !state.opponent.is_connected);

      return (
        <Field
          key={`field${item.id}`}
          ref={`field${item.id}`}
          value={item.value}
          backgroundColor={item.color}
          disabled={isDisabled}
          handleClick={this.handleFieldClick.bind(null, item.id, index)}/>
      );
    });

    return fields;
  },

  render() {
    let styles = this.getStyles();
    let state = this.state;

    return (
      <div>
        <div style={styles.header}>
          <Header
            isGameOver={state.isGameOver}
            hasOpponent={state.opponent && state.opponent.is_connected}
            player={state.currentPlayer}
            turn={state.turn}
            winner={state.winner}/>
        </div>
        <div style={styles.board}>
          {this.renderFields()}
        </div>
        <div style={styles.button}>
          <Button
            handleClick={this.handleClearBoard}
            label="new game"/>
        </div>
        <Loading visible={!state.isPlayerTurn && !state.isGameOver}/>
      </div>
    );
  }
});
