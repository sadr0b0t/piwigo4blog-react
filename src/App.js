import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Pagination from '@material-ui/lab/Pagination';
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

// https://stackoverflow.com/questions/56554586/how-to-use-usestyle-to-style-class-component-in-material-ui
const styles = theme => ({
    paginationUl: {justifyContent: 'flex-end'}
});

const SITE_ROOT = window.location.protocol + "//" + window.location.host; //"https://fotki.sadrobot.su"
const IMG_PAGE_SIZE = 100;

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
        this.state = {
            reply: '', 
            showShare: false,
            checked: [],
            category: {
                id: null, name: 'ROOT', representativePictureId: -1, idUppercat: null,
                representativePicture: null,
                childCats: [],
                parentCats: [],
                images: [],
                img_count: 0
            },
            page: 1
        };
        
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
    
    loadCategory = (cat_id, page) => {
        var query_str = '/plugins/piwigo4blog/api/category.php';
        var img_params = "img_lim=" + IMG_PAGE_SIZE + "&img_offset=" + (IMG_PAGE_SIZE * (page-1));
        if(cat_id !== undefined) {
            query_str += '?id=' + cat_id + "&" + img_params;
        } else {
            query_str += '?' + img_params;
        }
        
        this.readServerString(query_str, function(err, res) {
            if(!err) {
                this.setState({category: JSON.parse(res), page: page});
            } else {
                this.setState({category: [], page: page});
            }
        }.bind(this));
    }
    
    gotoCategory = (cat_id) => {
        this.loadCategory(cat_id, 1);
    }
    
    gotoPage = (page) => {
        this.loadCategory(this.state.category.id, page);
    }
    
    handleClickSelectAll = () => {
        var newChecked = [];
        for(var i=0; i < this.state.category.images.length; i++) {
            newChecked.push(this.state.category.images[i].id);
        }
        this.setState({checked: newChecked});
    }
    
    handleClickSelectNone = () => {
        this.setState({checked: []});
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
        const { classes } = this.props;
        
        var pageCount = this.state.category.img_count > 0 ?
            Math.trunc((this.state.category.img_count - 1) / IMG_PAGE_SIZE) + 1 : 1;
        
        var selImages = [];
        for(var i=0; i < this.state.category.images.length; i++) {
            if(this.state.checked.indexOf(this.state.category.images[i].id) !== -1) {
                selImages.push(this.state.category.images[i]);
            }
        }
        
        return (
            <div style={{textAlign: 'center', marginTop: 30}}>
                <div style={{textAlign: 'right'}}>
                    <span onClick={this.handleClickSelectAll} style={styleBtn}>Выбрать всё</span>
                    <span onClick={this.handleClickSelectNone} style={styleBtn}>Снять выделение</span>
                    <span onClick={this.handleClickShare} style={styleBtn}>Встроить в блог</span>
                </div>
                
                <Breadcrumbs style={{marginBottom: 10}} aria-label="breadcrumb">
                    {this.state.category.id !== null && <Link color="inherit" onClick={() => this.gotoCategory()}>
                        ROOT
                    </Link>}
                    {this.state.category.parentCats.map(catPathElem => {
                        return (
                            <Link color="inherit" onClick={() => this.gotoCategory(catPathElem.id)}>
                                {catPathElem.name}
                            </Link>
                        );
                    })}
                    
                    <Typography style={{fontWeight: 'bold'}} color="textPrimary">{this.state.category.name}</Typography>
                </Breadcrumbs>
                
                {this.state.category.img_count > 0 && <Pagination classes={{ul: classes.paginationUl}}
                    count={pageCount}
                    page={this.state.page}
                    style={{marginBottom: 10}}
                    color="primary"
                    onChange={(event, page) => this.gotoPage(page)} />}
                
                {this.state.category.childCats.length > 0 && <Grid container spacing={3}>
                    {this.state.category.childCats.map(cat => {
                        return (
                            /* 12-column grid layout: xs=3 => 4 cols; https://material-ui.com/components/grid/ */
                            <Grid item xs={3}>
                                <Paper style={{cursor: 'pointer', padding: 10, backgroundColor: '#DEDEDC', fontWeight: 'bold'}}>
                                    <div onClick={() => this.gotoCategory(cat.id)}>
                                        <div style={{height: 200}}>
                                            {cat.representativePicture != null &&
                                                <img style={{maxHeight: 200, maxWidth: 300}}
                                                    src={cat.representativePicture.thumb}
                                                    alt={cat.representativePicture.thumb}/>
                                            }
                                        </div>
                                        <div>{cat.name}</div>
                                    </div>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>}
                
                {this.state.category.images.length > 0 && <Grid container spacing={3}>
                    {this.state.category.images.map(img => {
                        return (
                            /* 12-column grid layout: xs=3 => 4 cols; https://material-ui.com/components/grid/ */
                            <Grid item xs={3}>
                                <Paper style={{cursor: 'pointer', padding: 10}} onClick={() => this.handleToggle(img.id)}>
                                    <div style={{height: 200}}>
                                        <img style={{maxHeight: 200, maxWidth: 300}} src={img.thumb} alt={img.thumb}/>
                                    </div>
                                    <div>
                                        <Checkbox
                                            color="primary"
                                            checked={this.state.checked.indexOf(img.id) !== -1}/>
                                        {img.name}
                                    </div>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>}
                
                {this.state.category.img_count > 0 &&<Pagination classes={{ul: classes.paginationUl}}
                    count={pageCount}
                    page={this.state.page}
                    style={{marginTop: 10}}
                    color="primary"
                    onChange={(event, page) => this.gotoPage(page)} />}
                
                <Dialog onClose={this.handleCloseShare} aria-labelledby="share-dialog-title" open={this.state.showShare}>
                    <DialogTitle id="share-dialog-title">Share</DialogTitle>
                    <ShareOptions images={selImages}/>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles) (App);

