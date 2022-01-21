import React, { Component } from "react";
import ShowBlog from "./ShowBlog/ShowBlog";
import { Hourglass } from 'react95';

export class Blog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      blogs: [],
      isloading: true
    };
  }

  async componentDidMount() {
    const posts = (await import('../../config/articles.config'))
                      .default
                      .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
    
    this.setState({
      posts,
      isloading: false
    });
  }

  render() {
    let post
    if (this.state.isloading) {
      post = <Hourglass size={64} style={{ padding: '1rem 0', margin: 'auto' }} />
    } else {
      post = this.state.posts.map(
        (post, index) => <ShowBlog key={index} {...post} {...post.profile} {...index} />
      );
    }

    return (
      <div style={{ overflow: 'auto' }}>
        {post}
      </div>
    );
  }
}

export default Blog;