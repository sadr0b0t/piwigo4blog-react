import React from 'react';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';

var styleBtn = {
    margin: 10,
    padding: 5,
    borderStyle: 'solid',
    cursor: 'pointer'
}

var SITE_ROOT = "https://fotki.sadrobot.su"

class ShareOptions extends React.Component {

    render() {
        var imgWidth = 800;
    
        var embedTxt = "";
        for(var i = 0; i < this.props.images.length; i++) {
            var img = this.props.images[i];
            embedTxt +=
                "<a href='" + SITE_ROOT + "/picture.php?/" + img.id  + "'>" +
                "<img src='" + SITE_ROOT + "/" + img.path + "' alt='" + img.file + "' width='" + imgWidth + "'/>" +
                "</a>\n";
        }
        
        return (
        <div>
            <div>share opts...</div>
            <div>
                <TextareaAutosize aria-label="empty textarea" placeholder="Empty">{embedTxt}</TextareaAutosize>;
            </div>
            <Button variant="contained" color="primary">Copy to clipboard</Button>
        </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {reply: '', images: [], showShare: false,
        checked: [],
        category: {id: undefined, name: 'ROOT', representative_picture_id: -1, id_uppercat: null},
        categories: [],
        categoryPath: []};
        
        this.gotoCategory();
    }
    
    readServerString(url, callback) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState === 4) { // only if req is "loaded"
                if (req.status === 200) { // only if "OK"
                    callback(undefined, req.responseText);
                } else {
                    // error
                    callback(new Error(req.status));
                }
            }
        };
        // can't use GET method here as it would quickly 
        // exceede max length limitation
        req.open("POST", url, true);

        //Send the proper header information along with the request
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send();
    }

    loadImages = (cat_id) => {
        if(cat_id !== undefined) {
            this.readServerString('/plugins/piwigo4blog/api/img-list.php?category=' + cat_id, function(err, res) {
                if(!err) {
                    this.setState({images: JSON.parse(res)});
                } else {
                    this.setState({images: []});
                }
            }.bind(this));
        } else {
            this.setState({images: []});
        }
    }
    
    loadCategories = (cat_id) => {
        var query_str = '/plugins/piwigo4blog/api/category-list.php';
        if(cat_id !== undefined) {
            query_str += '?id='+cat_id;
        }
        this.readServerString(query_str, function(err, res) {
            if(!err) {
                this.setState({categories: JSON.parse(res)});
            } else {
                this.setState({categories: []});
            }
        }.bind(this));
    }
    
    loadCategory = (cat_id) => {
        if(cat_id !== undefined) {
            var query_str = '/plugins/piwigo4blog/api/category-info.php?id='+cat_id;
            this.readServerString(query_str, function(err, res) {
                if(!err) {
                    this.setState({category: JSON.parse(res)});
                } else {
                    this.setState({category: []});
                }
            }.bind(this));
        } else {
            this.setState({category: {id: undefined, name: 'ROOT', representative_picture_id: -1, id_uppercat: null}});
        }
    }
    
    loadCategoryPath = (cat_id) => {
        if(cat_id !== undefined) {
            var query_str = '/plugins/piwigo4blog/api/category-parent.php?id='+cat_id;
            this.readServerString(query_str, function(err, res) {
                if(!err) {
                    this.setState({categoryPath: JSON.parse(res)});
                } else {
                    this.setState({categoryPath: []});
                }
            }.bind(this));
        } else {
            this.setState({categoryPath: []});
        }
    }
    
    gotoCategory = (cat_id) => {
        this.loadCategory(cat_id);
        this.loadCategoryPath(cat_id);
        this.loadCategories(cat_id);
        this.loadImages(cat_id);
    }
    
    handleClickShare = () => {
        this.setState({showShare: true});
    }
    
    handleCloseShare = value => {
        this.setState({showShare: false});
    }
    
    handleToggle = (img_id) => {
        const currentIndex = this.state.checked.indexOf(img_id);
        const newChecked = [...this.state.checked];

        if (currentIndex === -1) {
          newChecked.push(img_id);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        
        this.setState({checked: newChecked});
    };
    
    render() {
        var selImages = [];
        for(var i=0; i < this.state.images.length; i++) {
            if(this.state.checked.indexOf(this.state.images[i].id) !== -1) {
                selImages.push(this.state.images[i]);
            }
        }
        
        return (
            <div style={{textAlign: 'center', marginTop: 30}}>
                <p>
                    <span onClick={this.handleClickShare} style={styleBtn}>Встроить в блог</span>
                </p>
                <p style={{marginTop: 40, fontSize: 24}}>
                    Результат: <span style={{fontStyle: 'italic'}}>{this.state.reply}</span> 
                </p>
                
                <Breadcrumbs aria-label="breadcrumb">
                    {this.state.category.id !== undefined && <Link color="inherit" onClick={() => this.gotoCategory()}>
                        ROOT
                    </Link>}
                    {this.state.categoryPath.map(catPathElem => {
                        return (
                            <Link color="inherit" onClick={() => this.gotoCategory(catPathElem.id)}>
                                {catPathElem.name}
                            </Link>
                        );
                    })}
                    
                    <Typography color="textPrimary">{this.state.category.name}</Typography>
                </Breadcrumbs>
                
                {this.state.categories.length > 0 && <Grid container spacing={3}>
                    {this.state.categories.map(cat => {
                        return (
                            <Grid item xs={4}>
                                <Paper>
                                    <div onClick={() => this.gotoCategory(cat.id)}>{cat.name}</div>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>}
                
                {this.state.images.length > 0 && <Grid container spacing={3}>
                    {this.state.images.map(img => {
                        return (
                            <Grid item xs={4}>
                                <Paper onClick={() => this.handleToggle(img.id)}>
                                    <Checkbox
                                        color="primary"
                                        checked={this.state.checked.indexOf(img.id) !== -1}
                                    />
                                    <img width={300} src={img.path} alt={img.file}/>
                                    <div>{img.name}</div>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>}
                
                <Dialog onClose={this.handleCloseShare} aria-labelledby="share-dialog-title" open={this.state.showShare}>
                    <DialogTitle id="share-dialog-title">Share</DialogTitle>
                    <ShareOptions images={selImages}/>
                </Dialog>
            </div>
        );
    }
}

export default App;

