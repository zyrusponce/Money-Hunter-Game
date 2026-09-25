import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error,info){console.error('[Money Hunter] Unable to display adventure',error,info);}
  render(){return this.state.failed?<main className="error-page"><h1>Your adventure needs a moment.</h1><p>Unable to display the game. Your saved progress has not been deleted.</p><button className="btn" onClick={()=>window.location.reload()}>Try again</button></main>:this.props.children;}
}
